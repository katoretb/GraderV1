import React,{ useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`

function Index() {
  const navigate = useNavigate();

  const [assignmentData, setAssignmentData] = useState(null);
  const classId = sessionStorage.getItem("classId")

  const [ClassInfo, setClassInfo] = useState(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/ST/assignment/all?CID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setAssignmentData(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchClass = async () => {
      try {
        const response = await fetch(`${host}/TA/class/class?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setClassInfo(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClass()
    fetchData();
    
  }, [classId]);




  return (
    
      <div className="App">
        <Navbar></Navbar> 
          <br></br>
          {ClassInfo && (
          <div className="media d-flex align-items-center">
            <span style={{ margin: '0 10px' }}></span>
            <img className="mr-3" alt="thumbnail" src={ClassInfo['Thumbnail'] ? `${host}/Thumbnail/` + ClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3426/3426653.png"} style={{ width: '40px', height: '40px' }} />
            <span style={{ margin: '0 10px' }}></span>
            <div className="card" style={{ width: '30rem', padding: '10px' }}>
              <h5>{ClassInfo['ClassID']} {ClassInfo['ClassName']} {ClassInfo['ClassYear']}</h5>
              <h6>Instructor: {ClassInfo['Instructor']}</h6>
            </div>
          </div>
          )}
          <br />

          <div className="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
            <div className="card-header">
              <div className="row" style={{marginBottom:"-5px"}}>
                <div className="col">
                  <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                      <button className="nav-link active">Assignments</button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link link" onClick={() => {navigate("/Portfolio")}} >Portfolio</button>
                    </li>
                  </ul>
                </div>
                <div className="col-md-1">
                  <button type="button" onClick={() => navigate("/")} className="btn btn-primary float-end">Back</button>
                </div>
              </div>
            </div>
            <div className="card-body" style={{ overflowY: 'scroll' }}>
              <div>
                {assignmentData && ((assignmentData.length !== 0) && (
                  assignmentData.map(assign => {
                    return (
                    <div key={assign["LID"]} className={`card ${((assign.TurnIn === false) ? "div-with-dot" : "")}`} style={{ marginBottom: '2rem' }} onClick={() => {sessionStorage.setItem("LID", assign["LID"]); navigate("/Lab")}}>
                      <button  style={{ fontSize: '1.2rem', height:'4rem'}} className="fw-bold ">
                        <div className='row'>
                          <div className='col-2' style={{textAlign: 'Left'}}>
                            <span style={{marginLeft: '2rem'}}>{`Lab ${assign["Lab"]}`}</span>
                          </div>
                          <div className='col' style={{textAlign: 'Left'}}>
                            <span>{`${assign["Name"]}`}</span>
                          </div>
                          <div className='col-3'>
                          <span style={{fontWeight:'normal', fontSize: '0.9rem'}}>
                              {`Publish:`}
                            </span>
                            <span style={{fontWeight:'normal'}}>
                              {` ${assign["Publish"]}`}
                            </span>
                          </div>
                          <div className='col-3'>
                            <span style={{fontWeight:'normal', fontSize: '0.9rem'}}>
                              {`Due:`}
                            </span>
                            <span style={{fontWeight:'normal', color: `${(assign.Late === true) ? 'red' : 'black'}`}}>
                              {` ${assign["Due"]}`}
                            </span>
                          </div>
                          <div className='col-1'>
                            <span style={{fontWeight:'normal'}}>
                              {`${assign["hideScore"] ? ("-") : (assign["Score"])}/${assign["MaxScore"]}`}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                    )
                  })
                ))
              }
            </div>
          </div>
        </div>
      </div>
  );
}


export default Index;
