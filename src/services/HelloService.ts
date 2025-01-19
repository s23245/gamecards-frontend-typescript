import axios from 'axios';

const BASE_URL = 'https://gamecardsbackendjava-env.eba-g228jg6f.us-east-1.elasticbeanstalk.com';

export async function getHelloMessage() {
    const response = await axios.get(`${BASE_URL}/api/hello`);
    return response.data;
}