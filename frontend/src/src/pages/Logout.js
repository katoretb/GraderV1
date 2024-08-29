import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React from 'react'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function Logout(){
    const [isRun, _] = useState(0);


    async function run(){
        try {
            const response = await fetch(`${process.env.REACT_APP_HOST}/glob/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRF-TOKEN": Cookies.get("csrf_token")
                }
            })

            var data = await response.json();

            if(data['success']){
                Cookies.remove('Email')
                Cookies.remove('uid')
                Cookies.remove('role')
                Cookies.remove('csrf_token')
                window.location.href = "/login"
            }else{
                withReactContent(Swal).fire({
                    title: "Logout error!",
                    text: data["msg"],
                    icon: "error"
                }).then(ok => {
                    if(ok)
                        window.location.href = "/"
                });
            }
        }catch(error){
            withReactContent(Swal).fire({
                title: "Logout error!",
                text: "Please contact admin",
                icon: "error"
            }).then(ok => {
                if(ok)
                    window.location.href = "/"
            });
        }
    }

    useEffect(() => {
        run()
    }, [isRun])

    return (
        <div className="pos-center">
            <div className="loader"></div>
        </div> 
    )
}

export default Logout;