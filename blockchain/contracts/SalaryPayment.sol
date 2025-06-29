// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract SalaryPayment is AccessControl, Pausable {
    ERC20 public salaryToken;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    address[] private employeeList;
    mapping(address => Employee) private employees;

    struct Employee {
        uint256 salary;
        uint256 bonus;
        uint256 penalty;
    }

    event EmployeeAdded(address indexed wallet, uint256 salary);
    event EmployeeRemoved(address indexed wallet);
    event SalaryUpdated(address indexed wallet, uint256 salary);
    event BonusUpdated(address indexed wallet, uint256 bonus);
    event PenaltyUpdated(address indexed wallet, uint256 penalty);
    event SalariesPaid(uint256 indexed totalAmount);

    constructor(address _salaryToken, address _defaultAdmin) {
        salaryToken = ERC20(_salaryToken);
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(ADMIN_ROLE, _defaultAdmin);
        _grantRole(PAUSER_ROLE, _defaultAdmin);
    }

    modifier employeeExists(address _wallet) {
        require(employees[_wallet].salary > 0, "Employee does not exist");
        _;
    }

    function getEmployeesCount() external view returns (uint256) {
        return employeeList.length;
    }

    function getEmployeeSalary(
        address _wallet
    ) external view employeeExists(_wallet) returns (uint256 salary) {
        return employees[_wallet].salary;
    }

    function getEmployeeBonus(
        address _wallet
    ) external view employeeExists(_wallet) returns (uint256 bonus) {
        return employees[_wallet].bonus;
    }

    function getEmployeePenalty(
        address _wallet
    ) external view employeeExists(_wallet) returns (uint256 penalty) {
        return employees[_wallet].penalty;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setEmployeeSalary(
        address _wallet,
        uint256 _salary
    ) external employeeExists(_wallet) onlyRole(ADMIN_ROLE) whenNotPaused {
        Employee memory employee = employees[_wallet];
        require(_salary > employee.penalty - employee.bonus, "Unprofitable employee");

        employees[_wallet].salary = _salary;

        emit SalaryUpdated(_wallet, _salary);
    }

    function setEmployeeBonus(
        address _wallet,
        uint256 _bonus
    ) external employeeExists(_wallet) onlyRole(ADMIN_ROLE) whenNotPaused {
        employees[_wallet].bonus = _bonus;

        emit BonusUpdated(_wallet, _bonus);
    }

    function setEmployeePenalty(
        address _wallet,
        uint256 _penalty
    ) external employeeExists(_wallet) onlyRole(ADMIN_ROLE) whenNotPaused {
        require(
            employees[_wallet].salary + employees[_wallet].bonus > _penalty,
            "Unprofitable employee"
        );
        employees[_wallet].penalty = _penalty;

        emit PenaltyUpdated(_wallet, _penalty);
    }

    function addEmployee(
        address _wallet,
        uint256 _salary
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(employees[_wallet].salary == 0, "Employee already exists");
        require(_salary > 0, "Salary should be more than 0");
        employees[_wallet] = Employee({ salary: _salary, bonus: 0, penalty: 0 });
        employeeList.push(_wallet);

        emit EmployeeAdded(_wallet, _salary);
    }

    function removeEmployee(
        address _wallet
    ) external employeeExists(_wallet) onlyRole(ADMIN_ROLE) whenNotPaused {
        delete employees[_wallet];

        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employeeList[i] == _wallet) {
                employeeList[i] = employeeList[employeeList.length - 1];
                employeeList.pop();
                break;
            }
        }

        emit EmployeeRemoved(_wallet);
    }

    function payAllSalaries() external onlyRole(ADMIN_ROLE) whenNotPaused {
        uint256 totalPayout = 0;

        for (uint256 i = 0; i < employeeList.length; i++) {
            address wallet = employeeList[i];
            Employee memory employee = employees[wallet];
            uint256 payoutAmount = employee.salary + employee.bonus - employee.penalty;

            require(
                salaryToken.balanceOf(address(this)) >= payoutAmount,
                "Insufficient contract balance"
            );

            employees[wallet].bonus = 0;
            employees[wallet].penalty = 0;
            totalPayout += payoutAmount;
            salaryToken.transfer(wallet, payoutAmount);
        }

        emit SalariesPaid(totalPayout);
    }
}
