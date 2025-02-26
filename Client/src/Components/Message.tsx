import React from "react"
import { useParams } from "react-router"

interface encryptedMessageProps {
    encryptedmessage: string,
    iv: string,
}

interface MessageProps {
    message: encryptedMessageProps,
    sender: string,
    receiver: string,
    status: string
}

interface MessageComponentProps {
    message: MessageProps;
}

const Message: React.FC<MessageComponentProps> = ({ message }) => {

    const { username } = useParams();
    return (
        <>
            <div className={`flex w-[70%] ${message.sender === username ? 'justify-end' : 'justify-start'}`}>
                <div className={`bg-purple-200 text-wrap bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 p-2 rounded-lg shadow-md flex items-end ${message.message.encryptedmessage.length > 70 ? 'w-[70%]' : 'w-fit'}`}>
                    <span className="text-white pr-2 break-words whitespace-pre-wrap overflow-hidden w-full">
                        {message.message.encryptedmessage}
                    </span>
                    <div className="flex items-center gap-2">
                        {message.sender === username && message.status === 'sent' && <img className="h-4 object-cover" src="/sended.png" alt="sended" />}
                        {message.sender === username && message.status === 'delivered' && <img className="size-5 object-cover" src="/delivered.png" alt="delivered" />}
                        {message.sender === username && message.status === 'seen' && <img className="h-5 object-cover" src="/seen.png" alt="seen" />}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Message