const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// const autoscroll = () => {
//     //new message element
//     const $newMessage = $messages.lastElementChild

//     //heigth of the new message
//     const newMessageStyles = getComputedStyle($newMessage)
//     const newMessageMarin = parseInt(newMessageStyles.marginBottom)
//     const newMessageHeigth = $newMessage.offsetHeight + newMessageMarin

//     //visible height
//     const visibleHeight = $messages.offsetHeight

//     //heigth of messages contianer
//     const containerHeigth = $messages.scrollHeight

//     //how far have I scrolled?
//     const scrollOffset = $messages.scrollTop + visibleHeight

//     if (containerHeigth - newMessageHeigth <= scrollOffset) {
//         $messages.scrollTop = $messages.scrollHeight
//     }
// }

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message1: message.text,
        createdAt: moment(message.createdAt).format('LT')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    //autoscroll()
})

socket.on('locationMessage', (locationUrl) => {
    console.log(locationUrl)
    const html = Mustache.render(locationTemplate, {
        username: locationUrl.username,
        location: locationUrl.url,
        createdAt: moment(locationUrl.createdAt).format('LT')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    //autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //diable the button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    //const message = document.querySelector('input').value
    socket.emit('sendMessage', message, (error) => {
        //enable the send button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by browser.')
    }
    //disble the sendlocation button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})