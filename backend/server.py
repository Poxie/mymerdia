import os, jwt, socketio, eventlet, eventlet.wsgi
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

server = socketio.Server(cors_allowed_origins=os.environ.get('FRONTEND_ORIGIN'))
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(server, app.wsgi_app)
CORS(app, origins="*")

clients = {}

@server.event
def direct_message(socket_id, message):
    # Making sure recipient_id is present
    if 'recipient_id' not in message or not 'author_id' in message:
        return print('ids are missing in message', message)

    # Getting essential ids
    recipient_id = message['recipient_id']

    # Sending message to self
    server.emit('direct_message', message, room=socket_id)

    # Making sure recipient is connected
    if recipient_id in clients:
        recipient_socket_id = clients[recipient_id]
        server.emit('direct_message', message, room=recipient_socket_id)

@server.event
def channel_typing(socket_id, data):
    # Making sure necessary properties are present
    if 'recipient_id' not in data or 'channel_id' not in data:
        return print('ids are missing in typing data', data)

    # Getting essential ids
    recipient_id = data['recipient_id']
    channel_id = data['channel_id']
    state = data['state']

    # Getting recipient socket id
    if recipient_id in clients:
        recipient_socket_id = clients[recipient_id]
        server.emit('channel_typing', ({'channel_id': channel_id,'state': state}), room=recipient_socket_id)
    
@server.event
def dm_channel_created(socket_id, message):
    # Making sure ids are present
    if 'recipient_id' not in message:
        return print('recipient_id is missing in message', message)

    # Making sure channel_id is present
    if 'channel_id' not in message:
        return print('channel_id is missing in message ', message)

    # Getting recipient id
    recipient_id = message['recipient_id']

    # Checkiung if recipient is connected
    if recipient_id in clients:
        # Sending channel create event
        recipient_socket_id = clients[recipient_id]
        server.emit('dm_channel_created', message['channel_id'], room=recipient_socket_id)

@server.event
def connect(socket_id, environ, auth):
    # Getting token
    if not 'token' in auth:
        return

    token = auth['token']

    # # Setting up user_id and socket_id relations on connect
    id = get_my_id(token)
    clients[id] = socket_id

@server.event
def disconnet(socket_id):
    print('Client disconnected')

    # Removing socket from clients
    for key, val in clients.items():
        if val == socket_id:
            del clients[key]

# Getting id from self token
def get_my_id(token: str):
    # Checking if token is valid
    id = None
    try:
        data = jwt.decode(token, os.getenv('JWT_SECRET_KEY') or '', algorithms=['HS256'])
        id = data['id']
            
    except Exception as e:
        print('Error authenticating token:', e)
        raise ConnectionRefusedError('Authorization token is invalid.')

    return id

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', int(os.environ.get('WEBSOCKET_PORT')))), app)
