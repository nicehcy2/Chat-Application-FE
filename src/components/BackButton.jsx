import BackButtonImage from "../assets/images/back-button.png";
import { useNavigate } from 'react-router-dom';

export default function BackButton() {

    const navigate = useNavigate();
    
    return (
        <img
            src={BackButtonImage}
            alt="뒤로가기 버튼"
            className="w-5 h-5"
            onClick={() => navigate(-1)}
        />
    )
}
