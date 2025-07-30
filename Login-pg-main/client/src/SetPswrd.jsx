import {useState,useEffect} from 'react'
import axios from 'axios';

function SetPswrd(){

const [email,setEmail] = useState();
const [password,setPassword] = useState();

useEffect(()=>{
const Email = localStorage.getItem("email");
if(Email)setEmail(Email);
console.log(email);
},[]);


    const handleSubmit=(e) =>{

         e.preventDefault();

         const pass = password;

         axios.post('http://127.0.0.1:3001/setPassword',{email,pass}).then(result=> {console.log(result)})
      .catch(err => console.log(err))

    }

            return(
                <div className='top'>
                    <div>
                        {/* <p>Hey we are building here.</p> */}
                        <br></br>
                        {/* <p>{localStorage.getItem("email")}</p> */}
                        <form onSubmit={handleSubmit}>

                            <div>
          <strong>Password: </strong><br/>
          <input
            type="password"
             placeholder="Enter Password"
             name="password"
              onChange={(e) => setPassword(e.target.value)}
            />
        </div>
      <button type="submit">Set Password</button>
                        </form>
                    </div>

                </div>

            )




}




export default SetPswrd;