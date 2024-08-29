import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';


const host = `${process.env.REACT_APP_HOST}`

function Sentin() {
  const navigate = useNavigate();

  const [classId,] = useState(sessionStorage.getItem("classId"));
  const [LID,] = useState(sessionStorage.getItem("LID"))
  const [ClassInfo, setClassInfo] = useState({});

  const [Scores, setScores] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');



  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(`${host}/TA/class/score?LID=${LID}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        if(data.success){
          setScores(data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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

    fetchClass();
    fetchScores()
  }, [LID, classId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const [openDropdown, setOpenDropdown] = useState({});

  const handleToggleDropdown = (index) => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div>
      <Navbar />
      <br />
      <div className="media d-flex align-items-center">
        <span style={{ margin: '0 10px' }}></span>
        <img className="mr-3" alt="thumbnail" src={ClassInfo['Thumbnail'] ? `${host}/Thumbnail/` + ClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3426/3426653.png"} style={{ width: '40px', height: '40px' }} />
        <span style={{ margin: '0 10px' }}></span>
        <div className="card" style={{ width: '30rem', padding: '10px' }}>
          <h5>{ClassInfo['ClassID']} {ClassInfo['ClassName']} {ClassInfo['ClassYear']}</h5>
          <h6>Instructor: {ClassInfo['Instructor']}</h6>
        </div>
      </div>
      <br />
      <div className="card" style={{ marginLeft: '10em', marginRight: '10em', maxHeight: "70vh"}}>
        <div className="card-header">
          <div className="row" style={{marginBottom:"-5px"}}>
            <div className="col">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button className="nav-link link" onClick={() => {navigate("/AssignEdit")}}>Edit</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link active" >Sent in</button>
                </li>
                  <li className="nav-item">
                      <button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/AssignSus")}} >Suspicious</button>
                  </li>
              </ul>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary float-end" type="button" onClick={() => navigate("/AssignList")}>Back</button>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: 'scroll' }}>
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Search ID or Name" aria-label="Search" onChange={handleSearch} />
          </form>
          <br />
          {/* Loading indicator */}
          <div className='fixed_header'>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="col-1">#</th>
                  <th scope="col" className="col-2">Student ID</th>
                  <th scope="col">Name</th>
                  <th scope="col" className="col-1 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {Scores ? (
                  Scores["Students"].filter(element => (
                    (element["UID"] + element["Name"]).toLowerCase().includes(searchQuery.toLowerCase())
                  )).map((element, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <th scope="row">{index + 1}</th>
                        <td>{element["UID"]}</td>
                        <td>{element["Name"]}</td>
                        <td className='text-center'>
                          <button 
                              className="btn btn-secondary dropdown-toggle" 
                              type="button" 
                              onClick={() => handleToggleDropdown(index)}
                              aria-expanded={openDropdown[index] || false}
                            >
                            {element["AllScore"]}/{Scores.AllMaxScore}
                          </button>
                        </td>
                      </tr>
                      {openDropdown[index] && (
                        <tr>
                          <td colSpan="5">
                            <table className="table">
                              <thead>
                              </thead>
                              <tbody>
                                {element["SMT"].map((smt, smtIndex) => (
                                  <tr key={smtIndex}>
                                    <td style={{color: `${smt["Late"] ? 'red' : 'black'}`}}>Q{smtIndex + 1}: {smt["Time"]}</td>
                                    <td style={{color: `${smt["Late"] ? 'red' : 'black'}`}}>{smt["Score"]}/{smt["MaxScore"]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                  ) : (
                  <tr>
                    <th scope="row"></th>
                    <td>No data</td>
                    <td></td>
                  </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sentin;