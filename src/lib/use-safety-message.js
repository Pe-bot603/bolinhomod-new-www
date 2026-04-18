const React = require('react');

const useSafetyMessage = () => {
    const [showSafetyMessage, setShowSafetyMessage] = React.useState(false);

    const hasSelfHarmMention = text => {
        const keywords = /(suic[ií]dio|suicide|kill myself|me matar|quero morrer|tirar a pr[oó]pria vida|self.harm|automutila|cutting|self-harm|ideação|ideacion)/i;
        return keywords.test(text || '');
    };

    const checkAndShowIfNeeded = text => {
        if (hasSelfHarmMention(text)) {
            setShowSafetyMessage(true);
            return true;
        }
        return false;
    };

    return {
        showSafetyMessage,
        setShowSafetyMessage,
        hasSelfHarmMention,
        checkAndShowIfNeeded
    };
};

module.exports = useSafetyMessage;
