/* eslint-disable react/jsx-no-bind */
const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const connect = require('react-redux').connect;
const PropTypes = require('prop-types');

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

require('./posts.scss');

const STORAGE_KEY = 'bolinhomod.community.posts.v2';
const MAX_POST_LENGTH = 300;
const MAX_COMMENT_LENGTH = 160;

const hasSelfHarmMention = text => (
    /(suic[ií]dio|suicide|kill myself|me matar|quero morrer|tirar a pr[oó]pria vida)/i.test(text || '')
);

const toSafeInt = (value, fallback) => {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : fallback;
};

const loadPosts = () => {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.map(post => ({
            id: toSafeInt(post.id, Date.now()),
            user: post.user || 'anonymous',
            project: String(post.project || '').trim(),
            content: String(post.content || '').trim(),
            ageRestricted: Boolean(post.ageRestricted),
            minAge: toSafeInt(post.minAge, 0),
            createdAt: toSafeInt(post.createdAt, Date.now()),
            reactions: {
                hearts: toSafeInt(post.reactions && post.reactions.hearts, 0),
                stars: toSafeInt(post.reactions && post.reactions.stars, 0)
            },
            comments: Array.isArray(post.comments) ? post.comments.map(comment => ({
                id: toSafeInt(comment.id, Date.now()),
                user: comment.user || 'anonymous',
                text: String(comment.text || '').trim(),
                createdAt: toSafeInt(comment.createdAt, Date.now())
            })).filter(comment => comment.text) : []
        })).filter(post => post.project && post.content).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        return [];
    }
};

const PostsView = ({intl, user}) => {
    const username = user && user.username ? user.username : '';
    const isLoggedIn = Boolean(username);

    const [posts, setPosts] = React.useState(loadPosts);
    const [draft, setDraft] = React.useState({
        project: '',
        content: '',
        ageRestricted: false,
        minAge: 10
    });
    const [commentDrafts, setCommentDrafts] = React.useState({});
    const [reactions, setReactions] = React.useState({});
    const [showSafetyMessage, setShowSafetyMessage] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }, [posts]);

    const updateDraft = event => {
        const {name, value, type, checked} = event.target;
        const nextValue = type === 'checkbox' ? checked : value;
        setDraft(current => ({
            ...current,
            [name]: name === 'content' ? String(nextValue).slice(0, MAX_POST_LENGTH) : nextValue
        }));
    };

    const createPost = event => {
        event.preventDefault();
        if (!isLoggedIn) return;
        if (!draft.project.trim() || !draft.content.trim()) return;
        if (hasSelfHarmMention(draft.content)) {
            setShowSafetyMessage(true);
            return;
        }

        const now = Date.now();
        const newPost = {
            id: now,
            user: username,
            project: draft.project.trim(),
            content: draft.content.trim(),
            ageRestricted: draft.ageRestricted,
            minAge: draft.ageRestricted ? Number(draft.minAge) || 10 : 0,
            createdAt: now,
            reactions: {
                hearts: 0,
                stars: 0
            },
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
        const reactionKey = `${postId}:${field}`;
        const hasReacted = reactions[reactionKey];

        setReactions(current => ({...current, [reactionKey]: !hasReacted}));
        setPosts(current => current.map(post => {
            if (post.id !== postId) return post;
            const currentCount = toSafeInt(post.reactions[field], 0);
            return {
                ...post,
                reactions: {
                    ...post.reactions,
                    [field]: Math.max(0, currentCount + (hasReacted ? -1 : 1))
                }
            };
        }));
    };

    const updateCommentDraft = (postId, value) => {
        setCommentDrafts(current => ({
            ...current,
            [postId]: String(value).slice(0, MAX_COMMENT_LENGTH)
        }));
    };

    const addComment = (event, postId) => {
        event.preventDefault();
        if (!isLoggedIn) return;

        const text = (commentDrafts[postId] || '').trim();
        if (!text) return;
        if (hasSelfHarmMention(text)) {
            setShowSafetyMessage(true);
            return;
        }

        const now = Date.now();
        setPosts(current => current.map(post => (
            post.id === postId ? {
                ...post,
                comments: [...post.comments, {
                    id: now,
                    user: username,
                    text,
                    createdAt: now
                }]
            } : post
        )));
        setCommentDrafts(current => ({...current, [postId]: ''}));
    };

    return (
        <Page>
            <main className="posts-page">
                <section className="posts-composer">
                    <h1><FormattedMessage defaultMessage="Posts da Comunidade" id="posts.title" /></h1>
                    <p><FormattedMessage defaultMessage="Compartilhe projetos com a comunidade." id="posts.subtitle" /></p>

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
                        <p className="posts-char-count">{draft.content.length}/{MAX_POST_LENGTH}</p>
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
                            <FormattedMessage defaultMessage="Publicar post" id="posts.publish" />
                        </button>
                    </form>
                </section>

                <section className="posts-feed">
                    <h2><FormattedMessage defaultMessage="Feed de posts" id="posts.feed" /></h2>
                    {showSafetyMessage && (
                        <div className="posts-safety-message" role="alert">
                            <strong>
                                {intl.locale && intl.locale.startsWith('pt') ? (
                                    <FormattedMessage
                                        defaultMessage="Uma mensagem muito importante para você"
                                        id="safety.suicide.header.pt"
                                    />
                                ) : (
                                    <FormattedMessage
                                        defaultMessage="A important message to you"
                                        id="safety.suicide.header"
                                    />
                                )}
                            </strong>
                            <p>
                                {intl.locale && intl.locale.startsWith('pt') ? (
                                    <FormattedMessage
                                        defaultMessage="Ei... Se você está pensando em cometer isso, por favor, não comita esse ato. Sua vida importa e você é muito importante. Não cometa suicídio. Por favor, encontre ajuda imediatamente. Suicídio é algo muito sério e não pode ser ignorado. Sua saúde mental é muito importante. Se você é um menor de idade, por favor, fale com os seus pais ou com alguém de confiança imediatamente sobre seus pensamentos suicidos. Não deixe isso passar, pois é algo muito sério. Eu espero muito que você fique bem, seja quem for."
                                        id="safety.suicide.body.pt"
                                    />
                                ) : (
                                    <FormattedMessage
                                        defaultMessage="Hey, if you're thinking to commit that, please don't do it. Your life matters, and you're important. Don't commit suicide. Please, find help immediatly. Suicide is a serious thing and cannot be ignored. You mental health is important. Also, if you're an underage person, please tell your parents or someone you trust immediatly about your suicidal thoughts. Don't let this pass; it's very serious. I hope you get well soon, whoever you are."
                                        id="safety.suicide.body"
                                    />
                                )}
                            </p>
                            <button onClick={() => setShowSafetyMessage(false)} type="button">
                                <FormattedMessage defaultMessage="Fechar" id="general.close" />
                            </button>
                        </div>
                    )}
                    {posts.length === 0 && (
                        <p className="posts-empty"><FormattedMessage defaultMessage="Ainda não há posts." id="posts.empty" /></p>
                    )}
                    {posts.map(post => (
                        <article className="post-card" key={post.id}>
                            <header>
                                <strong>@{post.user}</strong>
                                <span>{post.project}</span>
                            </header>
                            <p>{post.content}</p>
                            <p className="post-time">{new Date(post.createdAt).toLocaleString(intl.locale || undefined)}</p>
                            {post.ageRestricted && (
                                <div className="age-badge">
                                    <FormattedMessage id="posts.ageBadge" values={{minAge: post.minAge}} />
                                </div>
                            )}
                            <div className="post-actions">
                                <button
                                    aria-pressed={Boolean(reactions[`${post.id}:hearts`])}
                                    className={reactions[`${post.id}:hearts`] ? 'active' : ''}
                                    onClick={() => reactPost(post.id, 'hearts')}
                                    type="button"
                                >
                                    ❤️ {post.reactions.hearts}
                                </button>
                                <button
                                    aria-pressed={Boolean(reactions[`${post.id}:stars`])}
                                    className={reactions[`${post.id}:stars`] ? 'active' : ''}
                                    onClick={() => reactPost(post.id, 'stars')}
                                    type="button"
                                >
                                    ⭐ {post.reactions.stars}
                                </button>
                            </div>
                            <ul className="comments-list">
                                {post.comments.map(comment => (
                                    <li key={comment.id}>
                                        <strong>@{comment.user}</strong>
                                        <span>{comment.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <form className="comment-form" onSubmit={event => addComment(event, post.id)}>
                                <input
                                    disabled={!isLoggedIn}
                                    onChange={event => updateCommentDraft(post.id, event.target.value)}
                                    placeholder="Escreva um comentário"
                                    value={commentDrafts[post.id] || ''}
                                />
                                <button disabled={!isLoggedIn} type="submit"><FormattedMessage id="posts.comment" /></button>
                            </form>
                        </article>
                    ))}
                </section>
            </main>
        </Page>
    );
};

PostsView.propTypes = {
    intl: PropTypes.shape({
        locale: PropTypes.string
    }).isRequired,
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
