export const formatBalance = (balance: number) =>
    balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
