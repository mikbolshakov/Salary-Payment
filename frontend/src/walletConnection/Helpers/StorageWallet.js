const VAR = "wallet"

export const connectWallet = () => {
    localStorage.setItem(VAR, "metamask");
}

export const disconnectWallet = () => {
    localStorage.removeItem(VAR);
}

export const getWalletType = () => {
    return localStorage.getItem(VAR);
}