# 1. BASE IMAGE: Using 'alpine' is a pro-choice because it reduces the 
# image size from ~180MB to ~25MB and minimizes the security attack surface.
FROM nginx:alpine

# 2. METADATA: Provides context for other engineers and automated tools
LABEL description="NGINX web server installed"

# 3. OWNERSHIP: Useful for tracking who is responsible for the image build
LABEL maintainer="VENKATESAN_SM"
LABEL version="1.0.0"

# 4. CONTENT COPYING:
# This command takes the CONTENTS of your local './html' folder and 
# places them into the Nginx default root directory.
# NOTE: If you have an 'index.html' inside your local './html', it will 
# overwrite the default Nginx welcome page.
COPY ./html /usr/share/nginx/html/

# 5. NETWORKING:
# This is documentation. It tells the container runtime (K8s/OpenShift) 
# that the application inside is listening on port 80.
EXPOSE 80

# 6. EXECUTION:
# Note: In the official NGINX image, the CMD is already defined as 
# ["nginx", "-g", "daemon off;"]. We don't need to repeat it here 
# unless we want to change Nginx's behavior.