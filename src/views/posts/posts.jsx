/* eslint-disable react/jsx-no-bind */
const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const connect = require('react-redux').connect;
const PropTypes = require('prop-types');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

require('./posts.scss');

const PostsView = ({user}) => {
    const username = user && user.username ? user.username : '';
    const isLoggedIn = Boolean(username);

    const [posts, setPosts] = React.useState([]);
    const [draft, setDraft] = React.useState({
        project: '',
        content: '',
        ageRestricted: false,
        minAge: 10
    });
    const [commentDrafts, setCommentDrafts] = React.useState({});

    const updateDraft = event => {
        const {name, value, type, checked} = event.target;
        setDraft(current => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const createPost = event => {
        event.preventDefault();
        if (!isLoggedIn) return;
        if (!draft.project.trim() || !draft.content.trim()) return;

        const newPost = {
            id: Date.now(),
            user: username,
            project: draft.project.trim(),
            content: draft.content.trim(),
            hearts: 0,
            stars: 0,
            ageRestricted: draft.ageRestricted,
            minAge: draft.ageRestricted ? Number(draft.minAge) || 10 : 0,
            comments: []
        };

        setPosts(current => [newPost, ...current]);
        setDraft(current => ({
            ...current,
            project: '',
            content: '',
            ageRestricted: false,
            minAge: 10
        }));
    };

    const reactPost = (postId, field) => {
        setPosts(current => current.map(post => (
            post.id === postId ? {...post, [field]: post[field] + 1} : post
        )));
    };

    const addComment = (event, postId) => {
        event.preventDefault();
        const text = (commentDrafts[postId] || '').trim();
        if (!text) return;
        setPosts(current => current.map(post => (
            post.id === postId ? {...post, comments: [...post.comments, text]} : post
        )));
        setCommentDrafts(current => ({...current, [postId]: ''}));
    };

    return (
        <Page>
            <main className="posts-page">
                <section className="posts-composer">
                    <h1><FormattedMessage id="posts.title" /></h1>
                    <p><FormattedMessage id="posts.subtitle" /></p>

                    {!isLoggedIn && (
                        <p className="posts-login-required">
                            <FormattedMessage id="posts.loginRequired" />
                        </p>
                    )}

                    <form onSubmit={createPost}>
                        <input
                            disabled={!isLoggedIn}
                            name="project"
                            onChange={updateDraft}
                            placeholder="Nome do projeto"
                            value={draft.project}
                        />
                        <textarea
                            disabled={!isLoggedIn}
                            name="content"
                            onChange={updateDraft}
                            placeholder="O que você quer compartilhar sobre seu projeto?"
                            value={draft.content}
                        />
                        <label className="age-checkbox">
                            <input
                                checked={draft.ageRestricted}
                                disabled={!isLoggedIn}
                                name="ageRestricted"
                                onChange={updateDraft}
                                type="checkbox"
                            />
                            <FormattedMessage id="posts.ageRestriction" />
                        </label>
                        {draft.ageRestricted && (
                            <label className="min-age-row">
                                <FormattedMessage id="posts.minimumAge" />
                                <input
                                    disabled={!isLoggedIn}
                                    max="18"
                                    min="6"
                                    name="minAge"
                                    onChange={updateDraft}
                                    type="number"
                                    value={draft.minAge}
                                />
                            </label>
                        )}
                        <button disabled={!isLoggedIn} type="submit">
                            <FormattedMessage id="posts.publish" />
                        </button>
                    </form>
                </section>

                <section className="posts-feed">
                    <h2><FormattedMessage id="posts.feed" /></h2>
                    {posts.length === 0 && (
                        <p className="posts-empty"><FormattedMessage id="posts.empty" /></p>
                    )}
                    {posts.map(post => (
                        <article className="post-card" key={post.id}>
                            <header>
                                <strong>@{post.user}</strong>
                                <span>{post.project}</span>
                            </header>
                            <p>{post.content}</p>
                            {post.ageRestricted && (
                                <div className="age-badge">
                                    <FormattedMessage id="posts.ageBadge" values={{minAge: post.minAge}} />
                                </div>
                            )}
                            <div className="post-actions">
                                <button onClick={() => reactPost(post.id, 'hearts')} type="button">
                                    ❤️ {post.hearts}
                                </button>
                                <button onClick={() => reactPost(post.id, 'stars')} type="button">
                                    ⭐ {post.stars}
                                </button>
                            </div>
                            <ul className="comments-list">
                                {post.comments.map((comment, index) => (
                                    <li key={`${post.id}-${index}`}>{comment}</li>
                                ))}
                            </ul>
                            <form className="comment-form" onSubmit={event => addComment(event, post.id)}>
                                <input
                                    onChange={event => setCommentDrafts(current => ({
                                        ...current,
                                        [post.id]: event.target.value
                                    }))}
                                    placeholder="Escreva um comentário"
                                    value={commentDrafts[post.id] || ''}
                                />
                                <button type="submit"><FormattedMessage id="posts.comment" /></button>
                            </form>
                        </article>
                    ))}
                </section>
            </main>
        </Page>
    );
};

PostsView.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string
    })
};

PostsView.defaultProps = {
    user: null
};

const ConnectedPostsView = connect(state => ({
    user: state.session.session.user
}))(injectIntl(PostsView));

render(<ConnectedPostsView />, document.getElementById('app'));
