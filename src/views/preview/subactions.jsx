const FormattedDate = require('react-intl').FormattedDate;
const FormattedMessage = require('react-intl').FormattedMessage;
const PropTypes = require('prop-types');
const React = require('react');
const FlexRow = require('../../components/flex-row/flex-row.jsx');

const Button = require('../../components/forms/button.jsx');
const AddToStudioModal = require('./add-to-studio.jsx');
const SocialModal = require('../../components/modal/social/container.jsx');
const ReportModal = require('../../components/modal/report/modal.jsx');
const {connect} = require('react-redux');
const {useState} = require('react');
const projectShape = require('./projectshape.jsx').projectShape;

const {selectIsMuted} = require('../../redux/session.js');
const StudioMuteEditMessage = require('../studio/studio-mute-edit-message.jsx').default;

require('./subactions.scss');

const Subactions = ({
    addToStudioOpen,
    canAddToStudio,
    canReport,
    isAdmin,
    isShared,
    onAddToStudioClicked,
    onAddToStudioClosed,
    onReportClicked,
    onReportClose,
    onReportSubmit,
    onSocialClicked,
    onSocialClosed,
    onToggleStudio,
    projectInfo,
    reportOpen,
    shareDate,
    showAddToStudioMuteError,
    socialOpen,
    onVisibilityModeChange,
    onAllowRemixesChange,
    allowRemix,
    visibilityMode,
    userOwnsProject
}) => {
    const [showMuteMessage, setShowMuteMessage] = useState(false);
    
    return (
        <FlexRow className="subactions">
            <div className="share-date">
                <div className="copyleft">&copy;</div>
                {' '}
                {/*  eslint-disable react/jsx-sort-props */}
                {shareDate ? (
                    <FormattedDate
                        value={Date.parse(shareDate)}
                        day="2-digit"
                        month="short"
                        year="numeric"
                    />
                ) : 'Unshared'}
                {/*  eslint-enable react/jsx-sort-props */}
            </div>
            <FlexRow className="action-buttons">
                {userOwnsProject && (
                    <div className="visibility-select-wrapper">
                        <label htmlFor="project-visibility-select">
                            <FormattedMessage id="project.visibility.label" />
                        </label>
                        <select
                            id="project-visibility-select"
                            onChange={onVisibilityModeChange}
                            value={visibilityMode}
                        >
                            <option value="private">
                                <FormattedMessage id="project.visibility.private" />
                            </option>
                            <option value="unlisted">
                                <FormattedMessage id="project.visibility.unlisted" />
                            </option>
                            <option value="public">
                                <FormattedMessage id="project.visibility.public" />
                            </option>
                        </select>
                        <label className="remix-checkbox" htmlFor="project-allow-remix">
                            <input
                                checked={allowRemix}
                                id="project-allow-remix"
                                onChange={onAllowRemixesChange}
                                type="checkbox"
                            />
                            <FormattedMessage id="project.remixPermission.label" />
                        </label>
                    </div>
                )}
                {(canReport) &&
                    <React.Fragment>
                        <Button
                            className="action-button report-button"
                            key="report-button"
                            onClick={onReportClicked}
                        >
                            <FormattedMessage id="general.report" />
                        </Button>
                        {reportOpen && (
                            <ReportModal
                                isOpen
                                key="report-modal"
                                type="project"
                                onReport={onReportSubmit}
                                onRequestClose={onReportClose}
                            />
                        )}
                    </React.Fragment>
                }
                {canAddToStudio &&
                    <React.Fragment>
                        <div
                            style={{position: 'relative'}}
                            /* eslint-disable react/jsx-no-bind */
                            onMouseEnter={() => showAddToStudioMuteError && setShowMuteMessage(true)}
                            onMouseLeave={() => showAddToStudioMuteError && setShowMuteMessage(false)}
                            /* eslint-enable react/jsx-no-bind */
                        >
                            <Button
                                className="action-button studio-button"
                                disabled={showAddToStudioMuteError}
                                key="add-to-studio-button"
                                onClick={showMuteMessage ? null : onAddToStudioClicked}
                            >
                                <FormattedMessage id="addToStudio.title" />
                            </Button>
                            {showMuteMessage && <StudioMuteEditMessage
                                className="studio-button-error"
                                messageId="project.mutedAddToStudio"
                            />}
                        </div>
                        {addToStudioOpen && (
                            <AddToStudioModal
                                isOpen
                                isAdmin={isAdmin}
                                key="add-to-studio-modal"
                                userOwnsProject={userOwnsProject}
                                onRequestClose={onAddToStudioClosed}
                                onToggleStudio={onToggleStudio}
                            />
                        )}
                    </React.Fragment>
                }
                {/* only show copy link button, modal if project is shared */}
                {(isShared || visibilityMode === 'unlisted') && projectInfo && projectInfo.id && (
                    <React.Fragment>
                        <Button
                            className="action-button copy-link-button"
                            onClick={onSocialClicked}
                        >
                            <FormattedMessage id="general.copyLink" />
                        </Button>
                        {socialOpen && (
                            <SocialModal
                                isOpen
                                key="social-modal"
                                projectId={projectInfo && projectInfo.id}
                                onRequestClose={onSocialClosed}
                            />
                        )}
                    </React.Fragment>
                )}
            </FlexRow>
        </FlexRow>
    );
};

Subactions.propTypes = {
    addToStudioOpen: PropTypes.bool,
    canAddToStudio: PropTypes.bool,
    canReport: PropTypes.bool,
    isAdmin: PropTypes.bool,
    isShared: PropTypes.bool,
    onAddToStudioClicked: PropTypes.func,
    onAddToStudioClosed: PropTypes.func,
    onReportClicked: PropTypes.func.isRequired,
    onReportClose: PropTypes.func.isRequired,
    onReportSubmit: PropTypes.func.isRequired,
    onSocialClicked: PropTypes.func,
    onSocialClosed: PropTypes.func,
    onToggleStudio: PropTypes.func,
    projectInfo: projectShape,
    reportOpen: PropTypes.bool,
    shareDate: PropTypes.string,
    showAddToStudioMuteError: PropTypes.bool,
    socialOpen: PropTypes.bool,
    userOwnsProject: PropTypes.bool,
    allowRemix: PropTypes.bool,
    visibilityMode: PropTypes.oneOf(['private', 'unlisted', 'public']),
    onVisibilityModeChange: PropTypes.func,
    onAllowRemixesChange: PropTypes.func
};

module.exports = connect(
    state => ({
        showAddToStudioMuteError: selectIsMuted(state)
    })
)(Subactions);
