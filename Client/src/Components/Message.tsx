import React from "react"
import { useParams } from "react-router"
import { motion } from "framer-motion"

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
    const isSender = message.sender === username;

    return (
        <motion.div
            className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className={`
                    max-w-[70%] 
                    md:max-w-[60%] 
                    text-wrap 
                    p-3 
                    rounded-2xl 
                    shadow-md 
                    flex 
                    items-end 
                    gap-1.5
                    ${isSender
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 rounded-tr-none'
                        : 'bg-[#2d2d44] rounded-tl-none'
                    }
                `}
            >
                <div className="text-white break-words whitespace-pre-wrap overflow-hidden w-full text-sm md:text-base">
                    {message.message.encryptedmessage}
                </div>

                {isSender && (
                    <div className="flex items-center justify-end flex-shrink-0 ml-1">
                        {message.status === 'sent' && (
                            <img className="h-4 w-4 object-contain" src="/sended.png" alt="sent" />
                        )}
                        {message.status === 'delivered' && (
                            <img className="h-5 w-5 object-contain" src="/delivered.png" alt="delivered" />
                        )}
                        {message.status === 'seen' && (
                            <img className="h-5 w-5 object-contain" src="/seen.png" alt="seen" />
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default Message