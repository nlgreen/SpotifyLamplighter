import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';


const SERVICE_URL = process.env.REACT_APP_API_URL;

const getText = async (setText, token) => {
    if (!token) {
	return;
    }
    const { data } = await axios.get(`${SERVICE_URL}/getSongTable`, {
	headers: {
	    Authorization: token
	}
    });
    setText(data.Input);
};

function App() {
    const [text, setText] = useState(null);
    const [searchParams] = useSearchParams();

    const token = searchParams.get('access_token');
    
    useEffect(() => {
	getText(setText, token);
    }, []);

    return (
	<div className='App'>
	    <header className='App-header'>
	        <img src={logo} className='App-logo' alt='logo' />
	        <p>{text || 'Loading...'}</p>
	    </header>
	</div>
    );
}

export default App;
