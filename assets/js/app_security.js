
(function () {
    console.log("%c STOP!", "color: red; font-size: 50px; font-weight: bold;");
    console.log("%c This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or hack someone's account, it is a scam.", "font-size: 18px;");

    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }

        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
            return false;
        }

        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    const style = document.createElement('style');
    style.innerHTML = `
        body {
            -webkit-user-select: none; 
            -ms-user-select: none; 
            user-select: none; 
        }
        
        input, textarea, [contenteditable="true"] {
            -webkit-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    `;
    document.head.appendChild(style);

})();
