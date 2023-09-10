import http from 'http';
import url from 'url';

const server = http.createServer(function (request, response) {
    const route = url.parse(request.url, true);
    if (route.pathname === '/api' && request.method === 'GET') {
        const { slack_name, track } = route.query;
        const apiResponse = {
            current_day: watch().day,
            utc_time: watch().utc_time,
            github_file_url:
                'https://github.com/ibotealaf/starter/blob/main/app.js',
            github_repo_url: 'https://github.com/ibotealaf/starter',
            status_code: 200,
        };

        if (slack_name) {
            apiResponse.slack_name = slack_name;
        }
        if (track) {
            apiResponse.track = track;
        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(apiResponse));
    } else {
        response.end('Invalid endpoint! Check url and try again');
    }
});
const PORT = process.env.PORT || 8000;

server.listen(PORT, function () {
    console.log('server is working...');
});

function watch() {
    const date = new Date();
    const daysOfTheWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    const day = daysOfTheWeek[date.getDay()];
    const utc_time = date.toISOString().split('.')[0] + 'Z'; // remove ms
    return { day, utc_time };
}
