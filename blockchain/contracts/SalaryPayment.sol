// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Salary Payment Contract
 * @author mikbolshakov
 * @notice This contract manages employee salaries using an ERC20 token.
 * @dev The contract uses AccessControl to manage roles and permissions.
 */
contract SalaryPayment is AccessControl {
    /**
     * @dev The ERC20 token used for paying salaries.
     */
    ERC20 public salaryToken;

    /**
     * @dev Struct representing an employee.
     *
     * @param salary The base salary amount.
     * @param bonus Additional bonus amount.
     * @param penalty Deductions or penalties applied to the salary.
     */
    struct Employee {
        uint256 salary;
        uint256 bonus;
        uint256 penalty;
    }

    /**
     * @dev Mapping of addresses to their corresponding Employee structs.
     */
    mapping(address => Employee) private employees;

    /**
     * @dev Array of all employee addresses.
     */
    address[] private employeeList;

    /**
     * @dev Role identifier for the SALARY_ROLE.
     */
    bytes32 public constant SALARY_ROLE = keccak256("SALARY_ROLE");

    /**
     * @dev Emitted when a new employee is added.
     *
     * @param wallet The address of the employee.
     * @param salary The initial salary of the employee.
     */
    event EmployeeAdded(address indexed wallet, uint256 salary);

    /**
     * @dev Emitted when an employee is removed.
     *
     * @param wallet The address of the employee being removed.
     */
    event EmployeeRemoved(address indexed wallet);

    /**
     * @dev Emitted when an employee's salary is updated.
     *
     * @param wallet The address of the employee whose salary was updated.
     * @param salary The new salary amount.
     */
    event SalaryUpdated(address indexed wallet, uint256 salary);

    /**
     * @dev Emitted when an employee's bonus is updated.
     *
     * @param wallet The address of the employee whose bonus was updated.
     * @param bonus The new bonus amount.
     */
    event BonusUpdated(address indexed wallet, uint256 bonus);

    /**
     * @dev Emitted when an employee's penalty is updated.
     *
     * @param wallet The address of the employee whose penalty was updated.
     * @param penalty The new penalty amount.
     */
    event PenaltyUpdated(address indexed wallet, uint256 penalty);

    /**
     * @dev Emitted when salaries are paid out to all employees.
     *
     * @param totalAmount The total amount paid out in salaries.
     */
    event SalariesPaid(uint256 totalAmount);

    /**
     * @dev Initializes the contract by setting the salary token and granting roles.
     *
     * @param _salaryToken The address of the ERC20 token used for salaries.
     * @param _defaultAdmin The address of the default admin.
     */
    constructor(address _salaryToken, address _defaultAdmin) {
        salaryToken = ERC20(_salaryToken);
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(SALARY_ROLE, _defaultAdmin);
    }

    /**
     * @dev Modifier to ensure that the specified employee exists before executing a function.
     *
     * @param _wallet The address of the employee.
     */
    modifier employeeExists(address _wallet) {
        require(employees[_wallet].salary > 0, "Employee does not exist");
        _;
    }

    /**
     * @dev Gets the number of employees currently registered.
     *
     * @return The count of employees.
     */
    function getEmployeesCount() external view returns (uint256) {
        return employeeList.length;
    }

    /**
     * @dev Retrieves the salary of an existing employee.
     *
     * @param _wallet The address of the employee.
     * @return salary The salary amount.
     */
    function getEmployeeSalary(
        address _wallet
    ) external view employeeExists(_wallet) returns (uint256 salary) {
        Employee memory emp = employees[_wallet];
        return emp.salary;
    }

    /**
     * @dev Retrieves the bonus of an existing employee.
     *
     * @param _wallet The address of the employee.
     * @return bonus The bonus amount.
     */
    function getEmployeeBonus(
        address _wallet
    ) external view employeeExists(_wallet) returns (uint256 bonus) {
        Employee memory emp = employees[_wallet];
        return emp.bonus;
    }

    /**
     * @dev Retrieves the penalty of an existing employee.
     *
     * @param _wallet The address of the employee.
     * @return penalty The penalty amount.
     */
    function getEmployeePenalty(
        address _wallet
    ) external view employeeExists(_wallet) returns (uint256 penalty) {
        Employee memory emp = employees[_wallet];
        return emp.penalty;
    }

    /**
     * @dev Updates the salary of an existing employee.
     *
     * @param _wallet The address of the employee.
     * @param _salary The new salary amount.
     */
    function setEmployeeSalary(
        address _wallet,
        uint256 _salary
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
        Employee memory employee = employees[_wallet];

        require(_salary > employee.penalty - employee.bonus, "Unprofitable employee");

        employees[_wallet].salary = _salary;
        emit SalaryUpdated(_wallet, _salary);
    }

    /**
     * @dev Updates the bonus of an existing employee.
     *
     * @param _wallet The address of the employee.
     * @param _bonus The new bonus amount.
     */
    function setEmployeeBonus(
        address _wallet,
        uint256 _bonus
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
        employees[_wallet].bonus = _bonus;
        emit BonusUpdated(_wallet, _bonus);
    }

    /**
     * @dev Updates the penalty of an existing employee.
     *
     * @param _wallet The address of the employee.
     * @param _penalty The new penalty amount.
     */
    function setEmployeePenalty(
        address _wallet,
        uint256 _penalty
    ) external employeeExists(_wallet) onlyRole(SALARY_ROLE) {
        require(
            employees[_wallet].salary + employees[_wallet].bonus > _penalty,
            "Unprofitable employee"
        );
        employees[_wallet].penalty = _penalty;
        emit PenaltyUpdated(_wallet, _penalty);
    }

    /**
     * @dev Adds a new employee to the system.
     *
     * @param _wallet The address of the employee.
     * @param _salary The initial salary amount.
     */
    function addEmployee(address _wallet, uint256 _salary) external onlyRole(SALARY_ROLE) {
        require(employees[_wallet].salary == 0, "Employee already exists");
        require(_salary > 0, "Salary should be more than 0");
        employees[_wallet] = Employee({ salary: _salary, bonus: 0, penalty: 0 });
        employeeList.push(_wallet);

        emit EmployeeAdded(_wallet, _salary);
    }

    /**
     * @dev Removes an existing employee from the system.
     *
     * @param _wallet The address of the employee to be removed.
     */
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

    /**
     * @dev Pays out salaries to all employees.
     */
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

    /**
     * @dev Deposits ERC20 tokens into the contract.
     *
     * @param _amount The amount of tokens to deposit.
     */
    function depositTokens(uint256 _amount) external {
        salaryToken.transferFrom(msg.sender, address(this), _amount);
    }
}
