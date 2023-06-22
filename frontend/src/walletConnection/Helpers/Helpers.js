export const shortAddress = (address) => {
    return address.substr(0, 5) + "..." + address.substr(-6);
}