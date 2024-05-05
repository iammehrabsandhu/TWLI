import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { shadows } from '@mui/system';

export default function ImgMediaCard() {
  return (
    <Card  sx={{ maxWidth: 345 , boxShadow: 5}}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="images/post1.JPG"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Lizard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
      <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <Button size="small">Share</Button>
        <p className='text-gray-500 font-light text-sm text-right ml-28'>@whiskeyno1ce</p>
      </CardActions>
    </Card>
    
  );
}

<Grid container alignItems="stretch" spacing={6} rowSpacing={12} columns={{ xs: 4, sm: 8, md: 12 }}>
<Grid item xs={12} sm={4}>
{posts.map((post, index) => (
<Post key={index} post={post} />
))}
</Grid>

</Grid>