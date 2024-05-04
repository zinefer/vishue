function render(state, height, width, x, y) {
    // Define the center of the gradient
    const centerX = width / 2;
    const centerY = height / 2;
  
    // Get the current time
    const now = new Date();
    
    // Calculate the rotation angle based on the current time
    const rotationAngle = (now.getSeconds() + now.getMilliseconds() / 1000) * Math.PI / 30; // Convert seconds and milliseconds to radians
  
    // Calculate the angle from the center to the current point and apply rotation
    const angle = Math.atan2(y - centerY, x - centerX) + rotationAngle;
  
    // Calculate the distance from the center to the current point
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  
    // Calculate the maximum distance from the center
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
  
    // Normalize the distance to fit within the range of 0 to 1
    const normalizedDistance = distance / maxDistance;
  
    // Calculate the gradient value based on the distance and angle
    const gradientValue = Math.abs(Math.cos(angle * 10) * normalizedDistance);
  
    // Calculate the color based on the gradient value
    const red = Math.round(gradientValue * 255);
    const green = Math.round(gradientValue * 215); // Adjusted for a golden color
    const blue = Math.round(gradientValue * 0);
  
    // Return the color in rgb format
    return `rgb(${red}, ${green}, ${blue})`;
  }