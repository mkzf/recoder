const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  eventlist: state => state.websocket.eventlist,
  websock: state => state.websocket.websock
}
export default getters
