import React from 'react';
import AllPayments from './allPayments/AllPayments';
import TokenInfo from './tokenInfo/TokenInfo';

const Footer = () => {
  return (
    <div className="footer">
      <AllPayments />
      <TokenInfo />
    </div>
  );
};

export default Footer;
