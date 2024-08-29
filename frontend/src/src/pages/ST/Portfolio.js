import React,{ useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const host = `${process.env.REACT_APP_HOST}`

function Index() {
  const navigate = useNavigate();

  const [Rank, setRank] = useState(null);
  const classId = sessionStorage.getItem("classId")

  const [ClassInfo, setClassInfo] = useState(null)

  const [data, setData] = useState({
    labels: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100'],
    datasets: [
      {
        label: "Number of students",
        data: [0,0,0,0,0,0,0,0,0,0],
        backgroundColor: 'rgb(0, 0, 0, 0)',
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistics of class',
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/ST/class/rank?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setRank(data.data);
        setData({
            labels: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100'],
            datasets: [
              {
                label: "Number of students",
                data: data.data["Chart"],
                backgroundColor: 'rgb(118, 191, 247)',
              },
            ],
          })
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
                      <button className="nav-link link" onClick={() => {navigate("/class")}}>Assignments</button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link active">Portfolio</button>
                    </li>
                  </ul>
                </div>
                <div className="col-md-1">
                  <button type="button" onClick={() => navigate("/")} className="btn btn-primary float-end">Back</button>
                </div>
              </div>
            </div>
            <div className="card-body">
                {Rank ? (
                <div className='row' style={{width: "100%"}}>
                    <div className='col'>
                        <center>
                            <span style={{fontSize: "2em"}}>Your score</span>
                            <br/><br/>
                            <div style={{width: "10rem", height: "10rem", border: "2px solid black", borderRadius: "5rem"}}>
                                <br/>
                                <span style={{fontSize: "2em"}}>{Rank["Score"]}</span>
                                <div style={{width: "6rem", height: "0.1rem", backgroundColor: "black"}}></div>
                                <span style={{fontSize: "2em"}}>{Rank["MaxScore"]}</span>
                            </div>
                            <br/>
                            <span>Your current rank in this course: {Rank["Rank"]} of {Rank["Amount"]}</span>
                        </center>
                    </div>
                    <div className='col' style={{textAlign: "center", color: "rgb(123, 123, 123)"}}>
                      <div className='row'>
                        <div className='col-1'>
                          <div className='text-rotated' style={{marginTop: "12em"}}>
                            Number of students
                          </div>
                        </div>
                        <div className='col'>
                          <Bar options={options} data={data} />
                          Score percentage
                        </div>
                      </div>
                    </div>
                </div>
                ) : (
                    <div>Loading</div>
                )}
            </div>
        </div>
      </div>
  );
}


export default Index;
