import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blog.css'; 

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');


  useEffect(() => {
    const blogData = [
      {
        id: 1,
        title: 'Top 10 Travel Destinations for 2024',
        date: '2024-04-15',
        category: 'Destinations',
        excerpt: 'Discover the most exciting travel spots for the upcoming year...',
        content: 'Full content of the blog post...',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        featured: true,
      },
      {
        id: 2,
        title: 'How to Travel Sustainably',
        date: '2024-05-10',
        category: 'Sustainability',
        excerpt: 'Learn how to minimize your environmental impact while traveling...',
        content: 'Full content of the blog post...',
        image: 'https://images.unsplash.com/photo-1506765515384-028b60a970df',
        featured: false,
      },
      {
        id: 3,
        title: 'Essential Travel Tips for First-Time Backpackers',
        date: '2024-06-05',
        category: 'Travel Tips',
        excerpt: 'Everything you need to know before embarking on your first backpacking adventure...',
        content: 'Full content of the blog post...',
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
        featured: true,
      },
      {
        id: 4,
        title: 'Cultural Etiquette Around the World',
        date: '2024-07-20',
        category: 'Culture',
        excerpt: 'Understand the do\'s and don\'ts to respect local cultures during your travels...',
        content: 'Full content of the blog post...',
        image: 'https://images.unsplash.com/photo-1523293830845-3ef4be892a83',
        featured: false,
      },
      {
        id: 5,
        title: 'Budget Travel: How to Save Money on Your Trips',
        date: '2024-08-10',
        category: 'Travel Tips',
        excerpt: 'Practical advice on traveling the world without breaking the bank...',
        content: 'Full content of the blog post...',
        image: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98',
        featured: true,
      },
      // Add more blog posts as needed
    ];
    setPosts(blogData);
    setFilteredPosts(blogData);
    setFeaturedPosts(blogData.filter(post => post.featured));
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterPosts(term, selectedCategory);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    filterPosts(searchTerm, category);
  };

  const filterPosts = (term, category) => {
    let tempPosts = [...posts];
    if (category !== 'All') {
      tempPosts = tempPosts.filter((post) => post.category === category);
    }
    if (term !== '') {
      tempPosts = tempPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(term.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(term.toLowerCase())
      );
    }
    setFilteredPosts(tempPosts);
  };

  return (
    <div className="blog">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="hero-overlay">
          <h1>Travel Blog</h1>
          <p>Insights, tips, and stories from around the world.</p>
          <Link to="/about" className="cta-button">Learn More</Link>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="featured-posts">
        <h2>Featured Posts</h2>
        <div className="featured-posts-container">
          {featuredPosts.map((post) => (
            <div key={post.id} className="featured-post">
              <img src={post.image} alt={post.title} />
              <div className="featured-post-content">
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="read-more">Read More</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Content */}
      <div className="blog-content">
        {/* Blog Posts */}
        <div className="blog-posts">
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search blog posts"
            />
          </div>

          {/* Posts List */}
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="blog-post">
                <img src={`${post.image}?w=400`} alt={post.title} className="post-image" />
                <div className="post-content">
                  <h3>{post.title}</h3>
                  <p className="post-date">{new Date(post.date).toLocaleDateString()}</p>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <Link to={`/blog/${post.id}`} className="read-more">
                    Read More
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts">No blog posts found.</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="blog-sidebar">
          {/* Categories */}
          <div className="sidebar-section">
            <h3>Categories</h3>
            <ul>
              {['All', 'Destinations', 'Sustainability', 'Travel Tips', 'Culture'].map((category) => (
                <li
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Posts */}
          <div className="sidebar-section">
            <h3>Recent Posts</h3>
            <ul>
              {posts.slice(-3).reverse().map((post) => (
                <li key={post.id}>
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe */}
          <div className="sidebar-section">
            <h3>Subscribe</h3>
            <form
              className="subscribe-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Subscribed successfully!');
              }}
            >
              <input
                type="email"
                placeholder="Your email"
                required
                aria-label="Email for subscription"
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
