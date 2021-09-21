# ryht-legislative

Web map for RYHT to use during the 2019 TX legislative session


## Note about local testing

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) blocks loading from Google Sheets.  So we need to preview this in a local server, as follows:

Open a command line window, go to this folder, type `python -m SimpleHTTPServer 1883` (for Python 2) or `python -m http.server 1883` (for Python 3) or `python3 -m http.server 1883` (to explicitly select Python3 in an environment that also has Python 2 installed), and leave that session running.

Then the page should be available at http://localhost:1883/ (you can change the number in the python command to also change it in the localhost URL).
