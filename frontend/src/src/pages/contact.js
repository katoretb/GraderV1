import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {ArrowRightCircle, ArrowLeftCircle, Linkedin, Github} from 'react-bootstrap-icons';

const contactData = {
    "P1": {
        "Name": "Sittha Darapisut",
        "Picture": "/kla.png",
        "Buttons": [
            {
                "Text": "LinkedIn",
                "BackgroundColor": "#0077b5",
                "Link": "https://www.linkedin.com/in/sittha-darapisut-5b018b255/"
            },
            {
                "Text": "GitHub",
                "BackgroundColor": "#000",
                "Link": "https://github.com/katoretb"
            }
        ]
    },
    "P2": {
        "Name": "Thanathorn Songchay",
        "Picture": "/ice.png",
        "Buttons": [
            {
                "Text": "LinkedIn",
                "BackgroundColor": "#0077b5",
                "Link": "https://www.linkedin.com/in/thanathorn-songchay-2280752b4/"
            },
            {
                "Text": "GitHub",
                "BackgroundColor": "#000",
                "Link": "https://github.com/KKaiow"
            }
        ]
    },
    "P3": {
        "Name": "Kornrawee Kochtat",
        "Picture": "/som.png",
        "Buttons": [
            {
                "Text": "LinkedIn",
                "BackgroundColor": "#0077b5",
                "Link": "https://www.linkedin.com/in/kornrawee-kochtat-60134a27a/"
            },
            {
                "Text": "GitHub",
                "BackgroundColor": "#000",
                "Link": "https://github.com/oransom48"
            }
        ]
    },
    "P4": {
        "Name": "Penek Suksuda",
        "Picture": "/ek.png",
        "Buttons": [
            {
                "Text": "GitHub",
                "BackgroundColor": "#000",
                "Link": "https://github.com/onevzz"
            },
            {
                "Text": "",
                "BackgroundColor": "#fff",
                "Link": ""
            }
        ]
    }
};

const ContactCard = ({ contact }) => {
    const cardStyle = {
        width: 'auto',
        borderRadius: '15px',
        border: '2px solid #3b82f6',
        textAlign: 'center',
        position: 'relative',
        margin: '40px',
        padding: '4px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    };

    const imgStyle = {
        width: '100px',
        height: '100px',
        objectFit: 'contain',
        borderRadius: '50%',
        border: '2px solid #3b82f6',
        position: 'absolute',
        top: '-50px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
    };

    const titleStyle = {
        marginTop: '60px',
        fontWeight: 'bold',
        color: '#1d4ed8',
    };

    const buttonStyle = {
        marginTop: '20px',
        borderRadius: '5px',
        color: 'white',
        display: 'block',
        textAlign: 'center',
        padding: '10px',
        textDecoration: 'none',
    };

    return (
        <div style={cardStyle}>
            <img src={contact.Picture} alt={contact.Name} style={{ ...imgStyle}} />
            <h4 style={titleStyle}>{contact.Name}</h4>
            {contact.Buttons.map((button, index) => (
                <a
                    key={index}
                    href={button.Link}
                    style={{ ...buttonStyle, backgroundColor: button.BackgroundColor, margin: "30px"}}
                >
                    {button.Text === "GitHub" ? <Github /> : <Linkedin />} {button.Text}
                </a>
            ))}
        </div>
    );
};

const ContactList = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const updateMobileView = () => {
        const contactKeys = Object.keys(contactData);
        return <ContactCard contact={contactData[contactKeys[currentIndex]]} />;
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % Object.keys(contactData).length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + Object.keys(contactData).length) % Object.keys(contactData).length);
    };

    const arrowStyle = {
        fontSize: '2rem',
        color: '#3b82f6',
        cursor: 'pointer',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
    };

    const arrowLeftStyle = {
        ...arrowStyle,
        left: '0px',
    };

    const arrowRightStyle = {
        ...arrowStyle,
        right: '0px',
    };

    return (
        <div className="bg-light container my-5">
            <div className="row d-none d-md-flex justify-content-center">
                {Object.keys(contactData).map((key) => (
                    <ContactCard key={key} contact={contactData[key]} />
                ))}
            </div>

            <div className="d-md-none position-relative">
                <div style={{ padding: '4px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    {updateMobileView()}
                </div>
                <i
                    className="bi bi-arrow-left-circle-fill"
                    style={arrowLeftStyle}
                    onClick={handlePrev}
                ><ArrowLeftCircle/></i>
                <i
                    className="bi bi-arrow-right-circle-fill"
                    style={arrowRightStyle}
                    onClick={handleNext}
                ><ArrowRightCircle/></i>
            </div>
        </div>
    );
};

export default ContactList;
