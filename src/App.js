import {BrowserRouter,Routes,Route} from 'react-router-dom';
import AttendanceSystem from './interface';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';
function App() {
  return (
    <>
     <BrowserRouter>
    <Routes>
    <Route path="/" element={<AttendanceSystem />} />
    <Route path="/admin" element={<AdminPanel />} />
    <Route path='/login' element={<AdminLogin/>}/>
  </Routes>
</BrowserRouter>
</>
  );
}

export default App;
