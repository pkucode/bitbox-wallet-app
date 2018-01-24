if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
        return this.substring(this_len - search.length, this_len) === search;
	};
}

// extConfig is a way to set config values which which are inserted
// externally by templating engines (code generation). A default value
// is provided in case the file wasn't generated but used directly,
// for convenience when developing. Both key and defaultValue must be
// strings and converted into the desired type.
function extConfig(key, defaultValue) {
    if(typeof key == "string" && key.startsWith("{{ ") && key.endsWith(" }}")) {
        return defaultValue;
    }
    return key;
}

const apiPort = extConfig('{{ API_PORT }}', '8082');
function isTLS() {
    return document.URL.startsWith("https://");
}

export const userLanguage = extConfig('{{ LANG }}', 'en');

export function apiURL(endpoint) {
    return (isTLS() ? "https://" : "http://") + "localhost:" + apiPort + "/api/" + endpoint;
}

export function apiWebsocket(msgCallback) {
    const socket = new WebSocket((isTLS() ? "wss://" : "ws://") + "localhost:" + apiPort + "/api/events");
    socket.onopen = function(event) {
        socket.send('Hello Server!');
    };
    socket.onerror = function(event) {
        console.log("error");
        console.log(event);
    };
    // Listen for messages
    socket.onmessage = function(event) {
        msgCallback(JSON.parse(event.data));
    };
    socket.onclose = function(event) {
        console.log("close");
    };
}

function handleError(json) {
    return new Promise((resolve, reject) => {
        if(json && json.error) {
            alert(json.error + " (todo: nice error msgs)");
            reject(json.error);
            return;
        }
        resolve(json);
    });
}

export function apiGet(endpoint) {
    return fetch(apiURL(endpoint)).
        then(r => r.json()).then(handleError);
}

export function apiPost(endpoint, body) {
    return fetch(
        apiURL(endpoint),
        {
            method: "POST",
            body: JSON.stringify(body)
        }).
        then(r => {
            return r.json();
        }).then(handleError);
}
