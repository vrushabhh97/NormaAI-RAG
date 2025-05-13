# Use Python 3.10 base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy everything from the current directory to /app
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Flask uses
EXPOSE 8080

# Set the entrypoint to run your app
CMD ["python", "fda_checker.py"]
