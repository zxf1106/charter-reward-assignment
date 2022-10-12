import transactions from "../transactions.json";

const transactionsAPI = () =>
  new Promise((res, rej) => {
    setTimeout(() => {
      res(transactions);
    }, 2000);
  });
export default transactionsAPI;
