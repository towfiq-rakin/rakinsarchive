

Assalamu Alaikum everyone.

Today I will present our Software Engineering Lab project, **Auction studio**, an e-commerce style web platform.

In the next few minutes, I will cover five parts: the software development methodology we used, key use cases, functional and non-functional requirements, the use case diagram, and finally a short project demonstration flow.

## 1) Software Development Methodology Used

For this project, we selected the **Agile Scrum-based iterative model**.
According to our SDLC report, we considered Waterfall, Spiral, V-Model, Incremental, and Agile.  
We chose Agile because our team is small, the timeline is semester-based, and we needed frequent review and adjustment.  

In our context, Agile gave us three practical benefits. 
First, it allowed us to deliver features in increments instead of waiting until the end.  
Second, it supported fast feedback from instructor and team members after every sprint.
Third, it reduced risk, because we found defects early in short cycles.


Our process followed standard Scrum ideas in a lightweight academic form:  
- Sprint planning to select backlog items from SRS features.
- Short daily syncs for blockers and progress.
- Sprint review to demo working features.
- Sprint retrospective to improve the next cycle.

We also aligned roles clearly: product backlog prioritization, sprint facilitation, and shared development/testing responsibilities.  
So overall, Agile helped us stay organized and delivery-focused while requirements evolved.

## 2) Some Use Cases

From the use case model, we identified three main actor groups: **Guest User**, **Registered User**, and **Admin User**.

For a **Guest User**, common use cases are:
- Register account.
- Log in.
- Browse products or listings.
- View product details.

For a **Registered User**, core use cases include:
- Add to cart, remove from cart, and update quantity.
- View cart with dynamic total.
- Checkout and place order.
- View order history and order details

For an **Admin User**, key use cases are:
- Add product.
- Edit product.
- Delete product.
- Manage inventory or stock.

In the current project implementation, we also demonstrate marketplace-style actions such as creating listings, placing bids, watchlist management, and closing auctions.  
This keeps the platform practical while still aligned with the SRS-driven user interaction model.

## 3) Functional and Non-Functional Requirements
Now, briefly on requirements.
##### Functional Requirement
Our SRS defines functional requirements FR1 to FR28.
A few important ones are:  
- User registration with uniqueness validation and secure password handling.
- Login/logout with proper session management and error handling.
- Product management by admin only.
- Product browsing with details, price, and availability.
- Cart operations and dynamic total calculation.
- Checkout with order creation and stock reduction.
- Order history with status tracking.

### Non-Functional Requirements
Key non-functional requirements include:  
- **Performance:** around 3-second page load under normal conditions and basic concurrent-user support.
- **Security:** password hashing, CSRF protection, secure sessions, and admin-only controls.
- **Usability:** clean navigation and responsive interface.
- **Reliability:** consistent data handling and high availability target.
- **Maintainability:** modular codebase and framework best practices.
  
These non-functional points are important because they determine production readiness, not just feature completeness.

## 4) Use Case Diagram Walkthrough
  
The use case diagram summarizes how actors interact with the system boundary.  
We have primary actors: Guest, Registered User, and Admin. 
We also model secondary systems: Authentication service and Database.
There are also relationship links like **include** and **extend**.  

For example:
- Add to Cart includes Login, because authentication is required.
- Checkout includes Cart Review and Login.
- Product Detail extends Product Browsing.
- Order Detail extends Order History.

So the diagram is not only a picture of features.  

It also clarifies dependencies, preconditions, and interaction sequence, which helped us map use cases directly to development tasks.

## 5) Short Demonstration Script

For the live demo, I will follow this short sequence:

1. First, open the home page and show the listing/browsing experience and category navigation.
2. Second, go to registration or login and show session-based authentication.
3. Third, as an authenticated user, create a new listing with title, description, price, and category.
4. Fourth, open a listing detail page and demonstrate placing a bid and adding a comment.
5. Fifth, add or remove an item from watchlist and show that user-specific state updates correctly.
6. Finally, log in as admin and show management capability such as content control and secure role-based access.


If time permits, I will also show error handling cases, like invalid credentials and protected actions when unauthenticated.
## Closing

To conclude, we used Agile Scrum to deliver this project incrementally, modeled requirements with clear use cases, and implemented core functional and quality requirements with a production-oriented mindset.

Thank you.