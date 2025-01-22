// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SalaryPayment is AccessControl {
    ERC20 public salaryToken;

    struct Employee {
        uint256 salary;
        uint256 bonus;
        uint256 penalty;
    }

    mapping(address => Employee) private employees;
    address[] private employeeList;

    bytes32 public constant SALARY_ROLE = keccak256("SALARY_ROLE");

    event EmployeeAdded(address indexed wallet, uint256 salary);
    event EmployeeRemoved(address indexed wallet);
    event SalaryUpdated(address indexed wallet, uint256 salary);
    event BonusUpdated(address indexed wallet, uint256 bonus);
    event PenaltyUpdated(address indexed wallet, uint256 penalty);
    event SalariesPaid(uint256 totalAmount);

    constructor(address _salaryToken, address _defaultAdmin) {
        salaryToken = ERC20(_salaryToken);
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(SALARY_ROLE, _defaultAdmin);
    }

    modifier employeeExists(address _wallet) {
        require(employees[_wallet].salary > 0, "Employee does not exist");
        _;
    }

    function getEmployeeDetails(
        address _wallet
    )
        external
        view
        employeeExists(_wallet)
        returns (uint256 salary, uint256 bonus, uint256 penalty)
    {
        Employee memory emp = employees[_wallet];
        return (emp.salary, emp.bonus, emp.penalty);
    }

    function getEmployeeCount() external view returns (uint256) {
        return employeeList.length;
    }

    function setEmployeeSalary(
        address _wallet,
        uint256 _salary
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
        Employee memory employee = employees[_wallet];

        require(_salary > employee.penalty - employee.bonus, "Unprofitable employee");

        employees[_wallet].salary = _salary;
    }

    function setEmployeeBonus(
        address _wallet,
        uint256 _bonus
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
        employees[_wallet].bonus = _bonus;
    }

    function setEmployeePenalty(
        address _wallet,
        uint256 _penalty
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
        require(
            employees[_wallet].salary + employees[_wallet].bonus > _penalty,
            "Unprofitable employee"
        );
        employees[_wallet].penalty = _penalty;
    }

    function addEmployee(address _wallet, uint256 _salary) external onlyRole(SALARY_ROLE) {
        require(employees[_wallet].salary == 0, "Employee already exists");
        require(_salary > 0, "Salary should be more than 0");
        employees[_wallet] = Employee(_salary, 0, 0);
        employeeList.push(_wallet);

        emit EmployeeAdded(_wallet, _salary);
    }

    function removeEmployee(
        address _wallet
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
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

    function payAllSalaries() external payable onlyRole(SALARY_ROLE) {
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

    function depositTokens(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        salaryToken.transferFrom(msg.sender, address(this), _amount);
    }
}
