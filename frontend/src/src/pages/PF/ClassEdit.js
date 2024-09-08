import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import Navbar from '../../components/Navbar'
import { useNavigate} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Download } from 'react-bootstrap-icons';

const host = `${process.env.REACT_APP_HOST}`


function ClassEdit() {
    const navigate = useNavigate();

    const [CSYID, ] = useState(sessionStorage.getItem("classId"));

    const [classData, setClassData] = useState(null)

    const [classID, setClassID] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [className, setClassName] = useState('');
    const [Archive, setArchive] = useState(sessionStorage.getItem("Archive") === 'true')

    const [timestamps, setTimestamps] = useState(Array(2).fill('')); // กำหนดขนาดของอาร์เรย์ตามจำนวนที่ต้องการใช้งาน (ในที่นี้คือ 2)

    
    useEffect(() => {
        const fetchClass = async () => {
        try {
            const response = await fetch(`${host}/TA/class/class?CSYID=${CSYID}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            }
            });
            const data = await response.json();
            setClassData({
                classid: CSYID,
                ClassID: data["ClassID"],
                SchoolYear: data["ClassYear"],
                ClassName: data["ClassName"],
                Thumbnail: data["Thumbnail"],
                Archive: data["Archive"]
            });
            setClassID(data["ClassID"]);
            setSchoolYear(data["ClassYear"]);
            setClassName(data["ClassName"])
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };  
      
        fetchClass()
    }, [CSYID]);

    const handleEditClick = async () => {
        try{
            withReactContent(Swal).fire({
                title: `Are you sure to update class with these infomations?`,
                html: `
                    <div class='row' style="width:100%;">
                        <div class='col-4' style="text-align:left;margin-left:5em;">
                            Class name<br/>
                            Class ID<br/>
                            schoolyear
                        </div>
                        <div class='col' style="text-align:left">
                            ${className} <br/>
                            ${classID} <br/>
                            ${schoolYear}
                        </div>
                    </div>`,
                icon: "question",
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: `Yes`,
                confirmButtonColor: "rgb(35, 165, 85)",
            }).then(async ok => {
                if(ok.isConfirmed){
                    const formData = new FormData();
                    formData.append('ClassName', className);
                    formData.append('ClassID',classID)
                    formData.append('SchoolYear',schoolYear)
                    formData.append('CSYID',CSYID)

                    const response = await fetch(`${host}/TA/class/edit`, {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                            "X-CSRF-TOKEN": Cookies.get("csrf_token")
                        },
                        body: formData,
                    });
                    const responseData = await response.json();
                    if (responseData.Status){
                        withReactContent(Swal).fire({
                            title: "Infomation updated",
                            icon: "success"
                        }).then(ok => {
                            if(ok)
                                window.location.href = "/"
                        });
                    }else{
                        withReactContent(Swal).fire({
                        title: "Error!",
                        icon: "error"
                        })
                    }
                }
            });
        }catch (error) {
            withReactContent(Swal).fire({
                title: "Please contact admin!",
                text: error,
                icon: "error"
            })
        }
    }

    const handleUpload = async (index) => {
      // Get the current date and time
        const now = new Date();
        const formattedTimestamp = now.toLocaleString();
        const response = null
  

      /* Thumbnail */
        if(index === 0){
            const fileInput = document.getElementById('inputGroupFile01');
            if(fileInput.files.length !== 1){
                withReactContent(Swal).fire({
                    title: "Please select file!",
                    icon: "warning"
                })
                return
            }
            const fileThumbnail = fileInput.files[0];

            const formData = new FormData();
            formData.append('CSYID', CSYID)
            formData.append('file',fileThumbnail)

            try {
                const response = await fetch(`${host}/upload/Thumbnail`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: formData,
                });
                const responseData = await response.json();
                
                if (responseData["success"]){
                    withReactContent(Swal).fire({
                        title: "Thumbnail uploaded",
                        icon: "success"
                    }).then(ok => {
                        if(ok)
                            window.location.href = "/"
                    });
                }else{
                    withReactContent(Swal).fire({
                        title: "Error!",
                        icon: "error"
                    })
                }
            } catch (error) {
                withReactContent(Swal).fire({
                    title: "Please contact admin!",
                    text: error,
                    icon: "error"
                })
            }
        }
      /* CSV */
        if (index === 1) {
            const fileInput = document.getElementById('inputGroupFile02');
            if(fileInput.files.length !== 1){
                withReactContent(Swal).fire({
                    title: "Please select file!",
                    icon: "warning"
                })
                return
            }
            const fileCSV = fileInput.files[0];
        
            const formData = new FormData();
            formData.append('CSYID', CSYID)
            formData.append('file', fileCSV)
            try {
                withReactContent(Swal).fire({
                    html: `<div class="pos-center">
                                <div class="loader"></div>
                            </div> `,
                    showCloseButton: false,
                    showCancelButton: false,
                    showConfirmButton: false,
                    background: "rgba(0, 0, 0, 0)"
                })
                const response = await fetch(`${host}/upload/CSV`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: formData,
                });
                const responseData = await response.json();
                withReactContent(Swal).close()
                if (responseData["success"]){
                    withReactContent(Swal).fire({
                        title: "CSV uploaded",
                        icon: "success"
                    })
                }else{
                    withReactContent(Swal).fire({
                        title: "Error!",
                        icon: "error",
                        text: responseData["msg"]
                    })
                }
            } catch (error) {
                withReactContent(Swal).fire({
                    title: "Please contact admin!",
                    text: error,
                    icon: "error"
                })
            }
        }
    

        if(response){
            setTimestamps(prevTimestamps => {
                const newTimestamps = [...prevTimestamps];
                newTimestamps[index] = formattedTimestamp;
                return newTimestamps;
            })
        };
    };

    // Too danger
    // const handleDelete = async () =>{
    //     try {
    //         withReactContent(Swal).fire({
    //             title: "Are you sure to delete this class?",
    //             icon: "warning",
    //             showCloseButton: true,
    //             showCancelButton: true,
    //             focusConfirm: false,
    //             confirmButtonText: `Delete`,
    //             confirmButtonColor: "rgb(217, 39, 39)",
    //         }).then(async ok => {
    //             if(ok.isConfirmed){
    //                 const formData = new FormData();
    //                 formData.append('CSYID',CSYID)

    //                 const response = await fetch(`${host}/TA/class/delete`, {
    //                     method: 'POST',
    //                     credentials: "include",
    //                     headers: {
    //                         "X-CSRF-TOKEN": Cookies.get("csrf_token")
    //                     },
    //                     body: formData,
    //                 });
    //                 const responseData = await response.json();
    //                 if (responseData.Status){
    //                     withReactContent(Swal).fire({
    //                         title: "Class Deleted",
    //                         icon: "success"
    //                     }).then(ok => {
    //                         if(ok)
    //                             window.location.href = "/"
    //                     });
    //                 }else{
    //                     withReactContent(Swal).fire({
    //                       title: "Error!",
    //                       icon: "error"
    //                     })
    //                 }
    //             }
    //         });
    //     }catch (error) {
    //         withReactContent(Swal).fire({
    //             title: "Please contact admin!",
    //             text: error,
    //             icon: "error"
    //         })
    //     }
    // }

    const handleArchive = async () =>{
        try {
            withReactContent(Swal).fire({
                title: `Are you sure to ${Archive ? "una" : "a"}rchive this class?`,
                icon: "warning",
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: `${Archive ? "Una" : "A"}rchive`,
                confirmButtonColor: "rgb(217, 39, 39)",
            }).then(async ok => {
                if(ok.isConfirmed){
                    const formData = new FormData();
                    formData.append('CSYID',CSYID)

                    fetch(`${host}/TA/class/Archive`, {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                            "X-CSRF-TOKEN": Cookies.get("csrf_token")
                        },
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                        withReactContent(Swal).fire({
                            title: data.msg,
                            icon: data.success ? "success" : "error"
                        }).then(() => {
                            setArchive(!Archive)
                        });
                    })
                }
            });
        }catch (error) {
            withReactContent(Swal).fire({
                title: "Please contact admin!",
                text: error,
                icon: "error"
            })
        }
    }

    const handleClassIDChange = (e) => {
        setClassID(e.target.value);
    }
    
    const handleSchoolYearChange = (e) => {
        setSchoolYear(e.target.value);
    }
    
    const handleClassNameChange = (e) => {
        setClassName(e.target.value);
    }

    let isCreateButtonDisabled = true

    if(classData) {
        const savebutcondi1 = classID === classData.ClassID && schoolYear === classData.SchoolYear && className === classData.ClassName;
        const savebutcondi2 = !classID || !schoolYear || !className;
        isCreateButtonDisabled = savebutcondi1 || savebutcondi2;
    }
    
    const handleGenTemplate = () => {
        const url = window.URL.createObjectURL(new Blob(["ID,Name (English),Section,Group\n"], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "StudentList-Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const downfile = async () => {
        fetch(`${process.env.REACT_APP_HOST}/glob/download`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            },
            body: JSON.stringify({ fileRequest: `3_0_${CSYID}`})
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                // Decode base64-encoded file content
                const decodedFileContent = atob(data.fileContent);
      
                // Convert decoded content to a Uint8Array
                const arrayBuffer = new Uint8Array(decodedFileContent.length);
                for (let i = 0; i < decodedFileContent.length; i++) {
                    arrayBuffer[i] = decodedFileContent.charCodeAt(i);
                }
      
                // Create a Blob from the array buffer
                const blob = new Blob([arrayBuffer], { type: data.fileType });
      
                // Create a temporary URL to the blob
                const url = window.URL.createObjectURL(blob);
      
                // Create a link element to trigger the download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = data.downloadFilename;
                document.body.appendChild(a);
                a.click();
      
                // Clean up by revoking the object URL
                window.URL.revokeObjectURL(url);
              }else{
                withReactContent(Swal).fire({
                  title: data.msg,
                  icon: "error"
                })
              }
        })
        .catch(error => console.error('Error:', error));
    }

  return (
    <div>
        <Navbar></Navbar> 
        <br></br>
        {classData ? (
        <div className="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
            <div className="card-header">
                <div className="row" style={{marginBottom:"-5px"}}>
                    <div className="col">
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <button className="nav-link active">Class edit</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link link" onClick={() => {sessionStorage.setItem("CSYID", classData.classid);navigate("/TAmanage")}} >TA management</button>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-2">
                        {/* <button className="btn btn-danger float-end" type="button" style={{marginLeft:"20px"}} onClick={handleDelete}>Delete</button> */}
                        {/* <button className="btn btn-danger float-end" type="button" style={{marginLeft:"20px"}} onClick={handleArchive}>{classData.Archive ? "Unarchive" : "Archive"}</button> */}
                        <button className="btn btn-primary float-end" type="button" style={{marginLeft:"20px"}} onClick={() => navigate("/")}>Back</button>
                        <input type="checkbox" className="btn-check float-end" id="btn-check-outlined" checked={Archive} autoComplete="off"/>
                        <label className="btn btn-outline-secondary float-end" htmlFor="btn-check-outlined" onClick={handleArchive}>{Archive ? "Unarchive" : "Archive"}</label><br></br>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <h3>Information</h3>
                <br/>
                <div className="row g-3">
                    <div className="col-md-3">
                        <label htmlFor="inputID" className="form-label">Class ID*</label>
                        <input type="text" className="form-control" id="inputID" placeholder="ex. 2301233 (7 digits number)" value={classID} onChange={handleClassIDChange} />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="inputYear" className="form-label">School Year/Semester*</label>
                        <input type="text" className="form-control" id="inputYear" placeholder="ex. 2020/1" value={schoolYear} onChange={handleSchoolYearChange}/>
                    </div>
                    <div className="col-6">
                        <label htmlFor="inputName" className="form-label">Class Name*</label>
                        <input type="text" className="form-control" id="inputClass" placeholder="Name" value={className} onChange={handleClassNameChange}/>
                    </div>
                </div>
                <div className="row" style={{marginTop: "10px",marginBottom: "20px"}}>
                    <div className="col">
                        <button type="button" className="btn btn-primary float-end" disabled={isCreateButtonDisabled} onClick={handleEditClick}>Save</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h3>Class Picture</h3>
                        <br/>
                        <div className="row">
                            <div className="col-md-3">
                                <img src={(classData.Thumbnail && classData.Thumbnail !== "null") ? `${host}/Thumbnail/` + classData.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} style={{ width: '100px', height: '100px', borderRadius: '5px', marginLeft: "0.5em"}}  alt="..."/>
                                <br/>
                                {(classData.Thumbnail && classData.Thumbnail !== "null") ? (<button type="button" className="btn btn-outline-dark" style={{width: "auto", textAlign: "Left", marginTop: "0.4em"}} onClick={() => {downfile()}}><Download /> Download</button>) : (<i/>)}
                            </div>
                            <div className="col">
                                <div className="input-group">
                                    <input type="file" className="form-control" id="inputGroupFile01" aria-describedby="inputGroupFileAddon04" aria-label="Upload" />
                                </div>
                                <br/>
                                <div className="row">
                                    <div className="col">
                                        {timestamps[0] && <p className="card-text">Last Submitted: <span>{timestamps[0]}</span></p>}
                                    </div>
                                    <div className="col-md-2">
                                        <button className="btn btn-primary float-end" type="button" id="inputGroupFileAddon04" onClick={() => handleUpload(0)}>Upload</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <h3>Student List</h3>
                        <br/>
                        <div className="row">
                            <div className="col">
                                <div className="input-group">
                                    <input type="file" className="form-control" id="inputGroupFile02" aria-describedby="inputGroupFileAddon04" aria-label="Upload" />
                                </div>
                                <br/>
                                <div className="row">
                                    <div className="col">
                                        {timestamps[1] && <p className="card-text">Last Submitted: <span>{timestamps[1]}</span></p>}
                                    </div>
                                    <div className="col-md-4">
                                        <button className="btn btn-primary float-end" type="button" id="inputGroupFileAddon04" onClick={() => handleUpload(1)}>Upload</button>
                                        <button className="btn btn-secondary float-end" type="button" style={{marginRight: "10px"}} onClick={handleGenTemplate}>Template</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ) : (
            <div>Loading...</div>
        )}
    </div>
  )
}


export default ClassEdit
