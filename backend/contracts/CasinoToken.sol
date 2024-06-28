// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20 {
    // Returns the total supply of tokens.
    function totalSupply() external view returns (uint256);

    // Returns the amount of tokens owned by an `account`.
    function balanceOf(address account) external view returns (uint256);

    /* Performs a transfer of tokens to a recipient.
    Returns a boolean value indicating whether the operation was successful.
    Emits a {Transfer} event. */
    function transfer(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /* Emitted when a transfer of tokens occurs.
    Note that `value` may be zero. */
    event Transfer(address indexed from, address indexed to, uint256 value);
}

// ERC20 Token Smart Contract
contract CasinoToken is IERC20 {
    // Data structures
    mapping(address => uint256) private _balances;

    // Variables
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    address public owner;

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "You are not authorized to execute this function."
        );
        _;
    }

    /* Sets the name and symbol of the token.
    The default value of {decimals} is 18. To select a different value for
    {decimals}, we must replace it. */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
    }

    // Returns the name of the token.
    function name() public view virtual returns (string memory) {
        return _name;
    }

    // Returns the symbol of the token, typically a shorter version of the name.
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /* Returns the number of decimals used to get its user representation.
    For example, if `decimals` is equal to `2`, a balance of `505` tokens should
    be shown to the user as `5.05` (`505 / 10 ** 2`).
    Tokens usually opt for a value of 18, mimicking the relationship between
    Ether and Wei. This is the value used by {ERC20}, unless this function is
    overridden. */
    function decimals() public view virtual returns (uint8) {
        return 0;
    }

    // See: {IERC20-totalSupply}.
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    // See: {IERC20-balanceOf}.
    function balanceOf(
        address account
    ) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /* See: {IERC20-transfer}.
    Requirements:
    - `to` cannot be the zero address.
    - The caller must have a balance of at least `amount`. */
    function transfer(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(from, to, amount);
        return true;
    }

    function mint(uint256 amount) public virtual onlyOwner returns (bool) {
        _mint(msg.sender, amount);
        return true;
    }

    /* Moves `amount` tokens from `sender` to `recipient`.
    This internal function is equivalent to {transfer}, and can be used to
    for example, implement automatic token fees, etc.
    Emits a {Transfer} event.
    Requirements:
    - `from` and `to` cannot be the zero address.
    - `from` must have a balance of at least `amount`. */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        uint256 fromBalance = _balances[from];
        require(
            fromBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    /* Creates `amount` tokens and assigns them to `account`, increasing
    the total supply.
    Emits a {Transfer} event with `from` set to the zero address.
    Requirements:
    - `account` cannot be the zero address. */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}
