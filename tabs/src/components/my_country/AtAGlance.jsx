import { React, useState, useEffect } from 'react';
import {
    Backdrop,
    CircularProgress,
    Box,
    Typography,
    Card,
    CardContent,
} from '@mui/material';

export function AtAGlance() {
    const [loading, setloading] = useState(false);

    useEffect(() => {
        (async () => {
            setloading(true);

            setloading(false);
        })();
    }, []);

    return (
        <div className="">
            <Box
                sx={{
                    boxShadow: 2,
                }}
            >
                <Backdrop
                    sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Box sx={{ display: 'flex', textAlign: 'center' }} >
                    <Card variant="outlined" sx={{ width: 200, margin: '1rem', boxShadow: '5px 5px lightblue' }} >
                        <CardContent>
                            <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                                Active users
                            </Typography>
                            <Typography variant="h1" component="div">
                                3
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ width: 200, margin: '1rem', boxShadow: '5px 5px yellow' }} >
                        <CardContent>
                            <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                                Pending invitations
                            </Typography>
                            <Typography variant="h1" component="div">
                                3
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ width: 200, margin: '1rem', boxShadow: '5px 5px pink' }} >
                        <CardContent>
                            <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                                Eionet groups covered
                            </Typography>
                            <Typography variant="h1" component="div">
                                3/8
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ width: 200, margin: '1rem', boxShadow: '5px 5px lightgreen' }} >
                        <CardContent>
                            <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                                Organisations
                            </Typography>
                            <Typography variant="h1" component="div">
                                10
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box >
        </div >
    );
}
