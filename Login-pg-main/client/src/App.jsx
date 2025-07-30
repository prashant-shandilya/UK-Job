import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import Home from './home'
import Login from './Login'
import SetPswrd from './setPswrd'
import OuthCallback from './OuthCallback'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Forgot from './Forgot'


function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Register/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/home' element={<Home/>}></Route>
          <Route path='/forgot' element={<Forgot/>}></Route>
          <Route path='/setPswrd' element={<SetPswrd/>}></Route>
          <Route path='/outhcallback' element={<OuthCallback/>}></Route>

        </Routes>
      </BrowserRouter>
  )
}

export default App
