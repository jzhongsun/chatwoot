
export const showBrowserNotificationNewMessage = (message) => {
    const { t } = window.i18n.global;
    console.info('new message', message);
    const notification = new Notification(
        '📤 ' + t('PUSH_NOTIFICATIONS.CONVERSATION_NEW_MESSAGE', { name: message?.sender?.name, inbox: message?.conversation?.inbox?.name }),
        {
            body: message?.content,
            icon: '/favicon-96x96.png',
            image: '/dashboard/images/onboarding/omnichannel-inbox.png',
            data: message,
            requireInteraction: true
        }
    );
    notification.onclick = (event) => {
        console.log('notification clicked', event);
        event.preventDefault();
        window.focus();
        notification.close();
    };
};

export const initBrowserNotification = () => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('notification permission granted');
        } else {
            console.log('notification permission denied', permission);
        }
    });
};
