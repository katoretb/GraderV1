import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React,{useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Callback() {
    const navigate = useNavigate();
    const [Email, setEmail] = useState("")
    const [Role, setRole] = useState(false)

    useEffect(() => {
        document.body.style.backgroundColor = "#F2F2F2"
    })

    const handleSub = async () => {
        if(Email === "")
            return

        const response = await fetch(`${process.env.REACT_APP_HOST}/glob/auth/testCallback`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    'email': Email,
                    'role': Role ? 2 : 1
                })
            })
        const Data = await response.json()
        if(!Data.success){
            withReactContent(Swal).fire({
                title: Data.msg,
                icon: "error"
            })
            return
        }
        Cookies.set("Email", Email)
        Cookies.set("uid", Email.split("@")[0])
        Cookies.set('csrf_token', Data["data"]["csrf_token"])
        if(Role){
            Cookies.set("role", 2)
        }else{
            Cookies.set("role", 1)
        }
        navigate("/")
    }

    const handleEmail = (e) => {
        setEmail(e.target.value)
    }
    const handleRole = (e) => {
        setRole(e.target.checked)
    }

    return (
        <div className="container align-items-center align-content-center" style={{background: "#FFF", borderWidth: "2px", borderStyle: "solid", borderRadius: "2px", width: "70vw", height: "50vh", marginTop: "25vh", marginRight: "15vw"}}>
            <input type="email" className="form-control" placeholder='Email' value={Email} onChange={handleEmail} style={{width: "30vw"}}></input>
            <br />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id={`inlineCheckbox`}
                checked={Role}
                onChange={handleRole}
              />
              <label className="form-check-label" htmlFor={`inlineCheckbox`}>
                Professor Mode
              </label>
            </div>
            <br />
            <br />
            <button type="button" className="btn btn-primary" onClick={handleSub}>Submit</button>
        </div>
    );
}


export default Callback;
