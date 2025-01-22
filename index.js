
window.addEventListener("load", (event) => {
    console.log("loaded");

    const btn_permission = document.getElementById("btn_permission");
    const div_pc_id = document.getElementById("div_id");
    var pc_id = null;

    // orientation API Start ------------

    btn_permission.addEventListener('click',()=>{
        requestDeviceOrientation();
    })


    function visibilityDivPcId(hide) {
        if (div_pc_id) {

            if(!hide){
                div_pc_id.style.visibility = 'visible';
                btn_permission.remove();
            }
            else{
                div_pc_id.remove();
            }
        }
    }


    function handleOrientation(event) {


        console.log(event);

        if(conn){
            conn.send([event.acceleration.x,event.acceleration.y,event.acceleration.z])
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
    var peer = new Peer();
    var conn = null;

    const btn_connect_to_pc = document.getElementById('btn_connect_to_pc')


    btn_connect_to_pc.addEventListener('click',()=>{
        connectToPc();
    })

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
            

            document.getElementById("el_status").innerHTML = "connected!"

            conn.send('hi from mobile!');

            visibilityDivPcId(true);
        });

        conn.on('data',(data)=>{
            console.log("recieved : ", data);
        })
    }

    // peer js API END ------------
});