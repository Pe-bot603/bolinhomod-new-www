const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;

const Page = require('../../components/page/www/page.jsx');
const render = require('../../lib/render.jsx');

require('./posts.scss');

const starterPosts = [
    {
        id: 1,
        user: 'NinaCoder',
        project: 'Labirinto de Laranja',
        content: 'Acabei de publicar meu novo projeto com fases secretas. Me digam o que melhorar!',
        hearts: 12,
        stars: 8,
        ageRestricted: false,
        minAge: 0,
        comments: ['Muito legal!', 'Adorei o visual!']
    },
    {
        id: 2,
        user: 'RafaBlocks',
        project: 'Aventura Espacial',
        content: 'Esse projeto é recomendado para 13+ por conter desafios avançados de lógica.',
        hearts: 20,
        stars: 13,
        ageRestricted: true,
        minAge: 13,
        comments: ['Top demais.', 'Os desafios ficaram incríveis!']
    }
];

const PostsView = injectIntl(() => {
    const [posts, setPosts] = React.useState(starterPosts);
    const [draft, setDraft] = React.useState({
        user: '',
        project: '',
        content: '',
        ageRestricted: false,
        minAge: 10
    });
    const [commentDrafts, setCommentDrafts] = React.useState({});

    const updateDraft = evt => {
        const {name, value, type, checked} = evt.target;
        setDraft(current => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const createPost = evt => {
        evt.preventDefault();
        if (!draft.user.trim() || !draft.project.trim() || !draft.content.trim()) return;
        const newPost = {
            id: Date.now(),
            user: draft.user.trim(),
            project: draft.project.trim(),
            content: draft.content.trim(),
            hearts: 0,
            stars: 0,
            ageRestricted: draft.ageRestricted,
            minAge: draft.ageRestricted ? Number(draft.minAge) || 10 : 0,
            comments: []
        };
        setPosts(current => [newPost, ...current]);
        setDraft({
            user: draft.user,
            project: '',
            content: '',
            ageRestricted: false,
            minAge: 10
        });
    };

    const reactPost = (postId, field) => {
        setPosts(current => current.map(post => (
            post.id === postId ? {...post, [field]: post[field] + 1} : post
        )));
    };

    const addComment = (evt, postId) => {
        evt.preventDefault();
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
                    <form onSubmit={createPost}>
                        <input name="user" onChange={updateDraft} placeholder="Seu usuário" value={draft.user} />
                        <input
                            name="project"
                            onChange={updateDraft}
                            placeholder="Nome do projeto"
                            value={draft.project}
                        />
                        <textarea
                            name="content"
                            onChange={updateDraft}
                            placeholder="O que você quer compartilhar sobre seu projeto?"
                            value={draft.content}
                        />
                        <label className="age-checkbox">
                            <input
                                checked={draft.ageRestricted}
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
                                    max="18"
                                    min="6"
                                    name="minAge"
                                    onChange={updateDraft}
                                    type="number"
                                    value={draft.minAge}
                                />
                            </label>
                        )}
                        <button type="submit"><FormattedMessage id="posts.publish" /></button>
                    </form>
                </section>

                <section className="posts-feed">
                    <h2><FormattedMessage id="posts.feed" /></h2>
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
                            <form className="comment-form" onSubmit={evt => addComment(evt, post.id)}>
                                <input
                                    onChange={evt => setCommentDrafts(current => ({
                                        ...current,
                                        [post.id]: evt.target.value
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
});

render(<PostsView />, document.getElementById('app'));
