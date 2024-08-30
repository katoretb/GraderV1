import React from 'react'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function Logout(){
    const [isRun, ] = useState(0);

    async function run(){
        await fetch(`${process.env.REACT_APP_HOST}/glob/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            }
        })

        Cookies.remove('Email')
        Cookies.remove('uid')
        Cookies.remove('role')
        Cookies.remove('csrf_token')
        window.location.href = "/login"
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