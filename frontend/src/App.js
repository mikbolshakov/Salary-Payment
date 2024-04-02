import Header from './pages/header/Header';
import EmployeeList from "./pages/spreadsheet/EmployeeList"
import Footer from './pages/footer/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <EmployeeList />
      <Footer/>
    </div>
  );
}

export default App;
