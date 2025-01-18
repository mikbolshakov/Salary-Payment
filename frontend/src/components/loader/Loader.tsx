import './Loader.css';

const Loader: React.FC = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-text">Transaction in progress, please wait...</div>
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
