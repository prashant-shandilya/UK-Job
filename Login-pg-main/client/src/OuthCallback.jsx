import {useState,useEffect} from 'react'
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function OuthCallback (){

    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");

    const [data, setData] = useState();

    useEffect(()=>{

         async function go() {
       const obj =  await axios.post('http://localhost:3001/outhcallback', { code })

        console.log(obj.data);
        setData(obj.data);
        }
        go();

    })
       



    return(
        <div>
            <h2>Outh Callback</h2>
            <p><br>This feature will not work as I have not provided the client key and secret in the backend.So tada</br></p>
            <p>{data}</p>
        </div>
    );
}

export default OuthCallback;
