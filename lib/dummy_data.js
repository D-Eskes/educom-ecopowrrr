import {SmartDevice, Device} from "./mongo_smart_device.js"


const device = new Device()
const smart_device = new SmartDevice(device)


export async function createDummyDataSmartDevice(postcode, number) {

    return smart_device.create({
        postcode: postcode,
        number: number,
        status: "inactive"
    }).then(function(result) {
        if (!result["acknowledged"]) {
            return
        }

        for (let i=0; i < 3; i++) {

            device.create({
                smart_device_id: result["insertedId"].toString(),
                serial_number: `${Math.round(10**9 * Math.random())}`,
                type: "solar",
                status: "inactive"

            })
        }
    })
}


// function registerClient(postcode, number, name, IBAN) {
//     createDummyDataSmartDevice(postcode, number, name, IBAN).then(function(result) {
        
//         const url = new URL("http://localhost:4000/register")

//         url.search = new URLSearchParams({
//             postcode: postcode,
//             number: number,
//             name: name,
//             IBAN: IBAN
//         }).toString()


//         fetch(url, {
//             method: 'POST',
//         })
//         .then(result => result.json())
//     })
// }



// registerClient("6363AZ", "18", "Karel", "1234")