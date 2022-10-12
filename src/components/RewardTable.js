import React, { useState, useEffect } from "react";
import transactionsAPI from "../APIs/transactionsAPI";

/**
 * calculate reward point for each transaction
 * @param {number} amount money spent for each purchase
 * @returns {number} reward point for each transaction
 */
const calculateReward = (amount) => {
  let reward = 0;
  reward += amount > 100 ? amount - 100 : 0;
  reward += amount > 50 ? amount - 50 : 0;
  return reward;
};

/**
 * get abbreviation of unique months name
 * @param {array} transactions
 * @returns {array} abbreviation of months name
 */
const generateSortedMonthsCols = (transactions) => {
  const monthsCols = transactions
    ?.map((transaction) => new Date(transaction.date))
    .sort((a, b) => a - b)
    .map((data) => data.toLocaleString("default", { month: "short" }));
  return Array.from(new Set(monthsCols));
};

/**
 * To get all generateColumnsNames for the reward table
 * @param {array} monthsColumns
 * @returns {array} an array of columns names
 */
const generateColumnsNames = (monthsColumns) => {
  return ["userId", "name", ...monthsColumns, "total"];
};

/**
 * calculate reward point of each transaction, total rewards for each month, and total rewards for the three consecutive months for each customer
 * @param {array} transactions
 * @returns {array} an array of object for all the customers' reward data
 */
const calculateRewardData = (transactions) => {
  const displayData = {};
  transactions.forEach((transaction) => {
    const { userId, name, amount, date } = transaction;

    const month = new Date(date).toLocaleString("default", {
      month: "short",
    });
    if (!displayData.hasOwnProperty(userId)) {
      displayData[userId] = { userId: userId, name: name, total: 0 };
    }

    if (!displayData[userId].hasOwnProperty(month)) {
      displayData[userId][month] = 0;
    }

    displayData[userId][month] += calculateReward(amount);
    displayData[userId]["total"] += calculateReward(amount);
  });
  return Object.values(displayData);
};

export default function RewardTable() {
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [monthsColumns, setMonthsColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * fetch data from transactionsAPI
   */
  const fetchData = () => {
    transactionsAPI()
      .then((res) => {
        setIsLoading(true);
        setTransactions(res.transactions);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setRewards(calculateRewardData(transactions));
    setMonthsColumns(generateSortedMonthsCols(transactions));
  }, [transactions]);

  return (
    <>
      {isLoading ? (
        <div className="spinner-border" data-testid="spinner" />
      ) : (
        <>
          <h2>Customers Reward Table</h2>
          <table>
            <thead>
              <tr>
                {generateColumnsNames(monthsColumns).map((column) => {
                  return <th key={column}>{column}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => {
                return (
                  <tr key={reward.name}>
                    {generateColumnsNames(monthsColumns).map((column) => {
                      return <td key={column}>{reward[column] || 0}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
