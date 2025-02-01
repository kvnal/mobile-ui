
window.addEventListener("load", (event) => {
    console.log("loaded");

    const btn_permission = document.getElementById("btn_permission");
    const div_pc_id = document.getElementById("div_id");

    const div_controller = document.getElementById("div_controller");
    const btn_throw_ball = document.getElementById("btn_throw_ball");

    const h4_info = document.getElementById("h4_info");

    var pc_id = null;

    // orientation API Start ------------

    btn_permission.addEventListener('click', () => {
        requestDeviceOrientation();

    });


    function visibilityDivPcId(hide) {
        if (div_pc_id) {

            if (!hide) {
                div_pc_id.style.visibility = 'visible';
                document.getElementById('div_permission').remove();
                // btn_permission.remove();
            }
            else {
                div_pc_id.remove();
            }
        }
    }


    function handleOrientation(event) {
        console.log(event);

        if (conn && !isAccelSent) {
            conn.send({accel: [event.acceleration.x, event.acceleration.y, event.acceleration.z]});
            
            console.log("accel sent")
            isAccelSent = true;
        }

    }


    async function requestDeviceOrientation() {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            //iOS 13+ devices
            try {
                const permissionState = await DeviceMotionEvent.requestPermission();
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleOrientation);

                    visibilityDivPcId(false);

                } else {
                    alert('Permission was denied');
                }
            } catch (error) {
                alert(error);
            }
        } else if ('DeviceMotionEvent' in window) {
            //non iOS 13+ devices

            console.log("not iOS");
            window.addEventListener('devicemotion', handleOrientation);

            visibilityDivPcId(false);

        } else {
            //not supported
            alert('not supported in this browser');
        }
    }
    // orientation API END ------------



    // peer js API START ------------
    var peer = new Peer(null, {
        config: {'iceServers': 
          [ { urls: 'stun:freestun.net:3478' }, { urls: 'turn:freestun.net:3478', username: 'free', credential: 'free' } ]
        } 
      , debug:2});
    var conn = null;
    var isAccelSent = true;

    const btn_connect_to_pc = document.getElementById('btn_connect_to_pc');



    btn_connect_to_pc.addEventListener('click', () => {
        connectToPc();
    });

    function connectToPc() {
        pc_id = document.getElementById("pc_id").value;

        if (pc_id) {
            connectP2P(pc_id);
        }
    }


    function connectP2P(id) {
        conn = peer.connect(id);
        // on open will be launch when you successfully connect to PeerServer
        conn.on('open', function () {

            console.log("connected to pc!");
            conn.send('hi from mobile!');

            document.getElementById("h4_status").innerHTML = "🟢 Connected";

            div_pc_id.remove();

            div_controller.style.visibility="visible"



            btn_throw_ball.addEventListener('click', () => {
                
                div_controller.style.visibility = 'hidden';
                h4_info.innerHTML = "hold mobile and swing to hit ball"
                setTimeout(() => {
                    conn.send({cmd:'throw'})
                    
                }, 2500);
                
                setTimeout(() => {
                    div_controller.style.visibility = 'visible'
                    h4_info.innerHTML = ""
                }, 4000);
            });

            visibilityDivPcId(true);
        });

        conn.on('data', (data) => {
            console.log("recieved : ", data);

            if(data && data['cmd']=="send_accel"){
                isAccelSent = false;
            }
        });

    }

    // peer js API END ------------
});