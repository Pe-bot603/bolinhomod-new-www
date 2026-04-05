const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const PropTypes = require('prop-types');

require('./safety-modal.scss');

const SafetyModal = ({isVisible, onClose, intl}) => {
    if (!isVisible) return null;

    const isPortuguese = intl.locale && intl.locale.startsWith('pt');

    return (
        <div className="safety-modal-overlay">
            <div className="safety-modal-container">
                <button className="safety-modal-close" onClick={onClose} type="button">
                    ×
                </button>
                
                <div className="safety-modal-content">
                    <svg 
                        className="safety-modal-icon" 
                        viewBox="0 0 100 100" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B6B" strokeWidth="2"/>
                        <path d="M50 20 L60 45 L85 45 L65 60 L75 85 L50 70 L25 85 L35 60 L15 45 L40 45 Z" fill="#FF6B6B"/>
                        <text x="50" y="95" textAnchor="middle" fontSize="8" fill="#666">Suicide Prevention</text>
                    </svg>

                    <h2 className="safety-modal-title">
                        <FormattedMessage
                            id={isPortuguese ? 'safety.suicide.header.pt' : 'safety.suicide.header'}
                        />
                    </h2>

                    <div className="safety-modal-body">
                        <FormattedMessage
                            id={isPortuguese ? 'safety.suicide.body.pt' : 'safety.suicide.body'}
                        />
                    </div>

                    <div className="safety-modal-resources">
                        <h3>Get Help:</h3>
                        <ul>
                            {isPortuguese ? (
                                <>
                                    <li>🇧🇷 CVV (Brasil): <strong>188</strong> - Ligação gratuita</li>
                                    <li>🇧🇷 Centro de Valorização da Vida: <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer">www.cvv.org.br</a></li>
                                </>
                            ) : (
                                <>
                                    <li>🇺🇸 National Suicide Prevention Lifeline: <strong>988</strong></li>
                                    <li>🌍 International Association for Suicide Prevention: <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer">Find help</a></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <button 
                        className="safety-modal-button" 
                        onClick={onClose} 
                        type="button"
                    >
                        <FormattedMessage id="general.close" />
                    </button>
                </div>
            </div>
        </div>
    );
};

SafetyModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.shape({
        locale: PropTypes.string
    }).isRequired
};

module.exports = SafetyModal;