// src/pages/Blog.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blog.css'; // Ensure this path is correct based on your project structure

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sample blog data (Replace with API calls if available)
  useEffect(() => {
    const blogData = [
      {
        id: 1,
        title: 'Top 10 Travel Destinations for 2024',
        date: '2024-04-15',
        category: 'Destinations',
        excerpt: 'Discover the most exciting travel spots for the upcoming year...',
        content: 'Full content of the blog post...',
        image: '/images/blog1.jpg',
      },
      {
        id: 2,
        title: 'How to Travel Sustainably',
        date: '2024-05-10',
        category: 'Sustainability',
        excerpt: 'Learn how to minimize your environmental impact while traveling...',
        content: 'Full content of the blog post...',
        image: '/images/blog2.jpg',
      },
      {
        id: 3,
        title: 'Essential Travel Tips for First-Time Backpackers',
        date: '2024-06-05',
        category: 'Travel Tips',
        excerpt: 'Everything you need to know before embarking on your first backpacking adventure...',
        content: 'Full content of the blog post...',
        image: '/images/blog3.jpg',
      },
      // Add more blog posts as needed
    ];
    setPosts(blogData);
    setFilteredPosts(blogData);
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
        <h1>Travel Blog</h1>
        <p>Insights, tips, and stories from around the world.</p>
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
            />
          </div>

          {/* Posts List */}
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="blog-post">
                <img src={post.image} alt={post.title} className="post-image" />
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
            <p>No blog posts found.</p>
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
              {posts.slice(-3).map((post) => (
                <li key={post.id}>
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe */}
          <div className="sidebar-section">
            <h3>Subscribe</h3>
            <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" required />
              <button type="submit" onClick={() => alert('Subscribed successfully!')}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
