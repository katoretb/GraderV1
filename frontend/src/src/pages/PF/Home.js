import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { Gear, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`

function HomePF() {
  const navigate = useNavigate();

  const [Email,] = useState(Cookies.get('Email'));
  const [courses, setCourses] = useState(null);
  const [classes, setClasses] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);
  
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [formData, setFormData] = useState({
    Creator: '',
    ClassName: '',
    ClassID: '',
    SchoolYear: ''
  });

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(`${host}/TA/class/classes`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        }
      });
      const data = await response.json();
      var sortedCourses = Object.fromEntries(Object.entries(data).sort((a, b) => b[0].localeCompare(a[0])));
      
      setCourses(sortedCourses);
      if(Object.keys(sortedCourses).length > 0) setExpandedYear(Object.keys(sortedCourses)[0])

      const classResponse = await fetch(`${host}/ST/class/classes`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        }
      });
      const classData = await classResponse.json();
      sortedCourses = Object.fromEntries(Object.entries(classData).sort((a, b) => b[0].localeCompare(a[0])));
      setClasses(sortedCourses);

    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  }, [])
  
  

  useEffect(() => {
    fetchCourses();
    setReady(true);
  }, [ready, fetchCourses]);
  

  const toggleYear = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
    setFormData({
      Creator: Email,
      ClassName: '',
      ClassID: '',
      SchoolYear: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      Creator:'',
      ClassName: '',
      ClassID: '',
      SchoolYear: ''
    });
    setExpanded(false);
  };
  
  const handleCreateClick = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${host}/TA/class/create`, {
        method: 'POST',
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
        body: JSON.stringify(formData)
      });
      const responseData = await response.json();
      if (responseData.Status) {
        fetchCourses();
        handleCancel()
        withReactContent(Swal).fire({
            title: "Class created successfully",
            icon: "success"
        })
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
  };

  return (
    <div>
      <Navbar />
      <br />
      <div className="d-flex align-items-center">
        <h5 className="me-2" style={{marginLeft:'10px'}}>Course</h5>
        {!expanded ? (<button  onClick={handleToggleExpand} className="btn btn-outline-secondary" type="button" id="button-addon2">+ New</button>) : null }
      </div>
      {!expanded ? (null) : ( 
          <div className="container d-flex justify-content-center">
            <div className="card" style={{ width: '800px' }}>
              <div className="card-header">
                <h4>Create Class</h4>
              </div>
              <div className="card-body">
                <form className="row g-3">
                  <div className="col-md-3">
                    <label htmlFor="inputID" className="form-label">Class ID</label>
                    <input type="text" name="ClassID" className="form-control" id="inputID" placeholder="e.g., 2301240"  onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="inputYear" className="form-label">Academic year/Semester</label>
                    <input type="text" name="SchoolYear" className="form-control" id="inputYear" placeholder="e.g., 2021/2" onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label htmlFor="inputName" className="form-label">Class Name</label>
                    <input type="text" name="ClassName" className="form-control" id="inputClass" placeholder="e.g., Introduction to Computer Science" onChange={handleChange} />
                  </div>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="button" className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                    <div>
                      <button type="button" className="btn btn-primary" onClick={handleCreateClick}>Create</button>
                      <br />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          )}


      {courses && ready ? (
        <main>
          <div>
            <br></br>
            {/* วนลูปเพื่อแสดง container แยกตามปีการศึกษา */}
            {Object.entries(courses).map(([year, classes]) => (
              <div key={year} className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
                <h5 className='unselectable' onClick={() => toggleYear(year)} style={{ cursor: 'pointer' }}>
                  {expandedYear === year ? <ChevronDown /> : <ChevronRight />} {year}
                </h5>
                {expandedYear === year && (
                  <div className="row row-cols-1 row-cols-md-5 g-2">
                    {/* วนลูปเพื่อแสดงข้อมูลคอร์สในแต่ละปีการศึกษา */}
                    {classes.map(course => (
                      <div className="card" style={{width: '200px', marginLeft: "10px", marginRight: "10px"}} key={course.ClassID}>
                        <img className="card-img-top w-100 d-block" src={course.Thumbnail ? `${host}/Thumbnail/` + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} style={{ width: '190px', height: '190px', paddingTop: '5px', borderRadius: '5px'}}  alt="..."/>
                        <div className="card-body">
                          <h4 className="card-title">{course.ClassName}</h4>
                          <p style={{fontSize: "1 rem",color: "rgb(96, 96, 96)", display: (course.Archive ? "block" : "none")}}>{" (Archived)"}</p>
                          <p className="card-text">ID: {course.ClassID}</p>
                          <button className="btn btn-primary" type="button" onClick={() => {sessionStorage.setItem("classId", course.ID);  sessionStorage.setItem("Email", Email);  navigate("/AssignList");}}>
                            View course
                          </button>
                          <button className="btn btn-warning float-end" type="button" onClick={() => {sessionStorage.setItem("Thumbnail", course.Thumbnail);sessionStorage.setItem("classId", course.ID);sessionStorage.setItem("ClassID", course.ClassID);sessionStorage.setItem("SchoolYear", year);sessionStorage.setItem("ClassName", course.ClassName);sessionStorage.setItem("Archive", course.Archive);navigate("/ClassEdit")}}>
                            <Gear />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      ) : (
        "")}
        
      {(classes && Object.keys(classes).length > 0) && ready ? (
          <div>
            <br></br>
            {/* วนลูปเพื่อแสดง container แยกตามปีการศึกษา */}
            {Object.entries(classes).map(([year, classes]) => (
              <div key={year} className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
                <h5 className='unselectable' onClick={() => toggleYear(year)} style={{ cursor: 'pointer' }}>
                  {expandedYear === year ? <ChevronDown /> : <ChevronRight />} {year} (Student view)
                </h5>

                {expandedYear === year && (
                  <div className="row row-cols-1 row-cols-md-5 g-2">
                    {/* วนลูปเพื่อแสดงข้อมูลคอร์สในแต่ละปีการศึกษา */}
                    {classes.map((course) => (
                      <div className="card" style={{width: '200px', marginLeft: "10px", marginRight: "10px"}} key={course.ClassID}>
                        <img className="card-img-top w-100 d-block" src={course.Thumbnail ? `${host}/Thumbnail/` + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} style={{ width: '190px', height: '190px', paddingTop: '5px', borderRadius: '5px'}}  alt="..."/>
                        <div className="card-body">
                          <h4 className="card-title">{course.ClassName}</h4>
                          <p className="card-text">ID: {course.ClassID}</p>
                          <button className="btn btn-primary" type="button" onClick={() => {sessionStorage.setItem("classId", course.ID);  sessionStorage.setItem("Email", Email);  navigate("/Class");}}>
                            View course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
      ) : (null)}
    </div>
  )
}

export default HomePF
